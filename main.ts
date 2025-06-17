import { Plugin, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, TFile, Notice } from 'obsidian';

interface LinkSuggestion {
	title: string;
	file: TFile;
	type: 'note' | 'heading' | 'block';
	displayText: string;
	linkText: string;
}

class AutoLinkerSuggest extends EditorSuggest<LinkSuggestion> {
	plugin: AutoLinkerPlugin;

	constructor(plugin: AutoLinkerPlugin) {
		super(plugin.app);
		this.plugin = plugin;
	}

	onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
		const line = editor.getLine(cursor.line);
		const beforeCursor = line.substring(0, cursor.ch);
		
		// Trigger when typing [[
		const linkMatch = beforeCursor.match(/\[\[([^\]]*?)$/);
		if (linkMatch) {
			return {
				end: cursor,
				start: {
					line: cursor.line,
					ch: cursor.ch - linkMatch[1].length
				},
				query: linkMatch[1]
			};
		}

		// Also trigger on regular typing for auto-suggestion
		const wordMatch = beforeCursor.match(/(\S+)$/);
		if (wordMatch && wordMatch[1].length >= 2) {
			return {
				end: cursor,
				start: {
					line: cursor.line,
					ch: cursor.ch - wordMatch[1].length
				},
				query: wordMatch[1]
			};
		}

		return null;
	}

	getSuggestions(context: EditorSuggestContext): LinkSuggestion[] {
		const query = context.query.toLowerCase();
		if (query.length < 2) return [];

		const suggestions: LinkSuggestion[] = [];
		const files = this.app.vault.getMarkdownFiles();

		for (const file of files) {
			// Skip current file
			if (file === context.file) continue;

			// Check file title
			const fileName = file.basename.toLowerCase();
			if (fileName.includes(query)) {
				suggestions.push({
					title: file.basename,
					file: file,
					type: 'note',
					displayText: `📄 ${file.basename}`,
					linkText: file.basename
				});
			}

			// Check headings and blocks in file content
			const cache = this.app.metadataCache.getFileCache(file);
			if (cache) {
				// Check headings
				if (cache.headings) {
					for (const heading of cache.headings) {
						if (heading.heading.toLowerCase().includes(query)) {
							suggestions.push({
								title: heading.heading,
								file: file,
								type: 'heading',
								displayText: `${'#'.repeat(heading.level)} ${heading.heading} (${file.basename})`,
								linkText: `#${heading.heading}`
							});
						}
					}
				}

				// Check blocks
				if (cache.blocks) {
					const fileContent = this.app.vault.cachedRead(file);
					fileContent.then(content => {
						const lines = content.split('\n');
						for (const [blockId, block] of Object.entries(cache.blocks)) {
							const blockLine = lines[block.position.start.line];
							if (blockLine && blockLine.toLowerCase().includes(query)) {
								suggestions.push({
									title: blockLine.trim(),
									file: file,
									type: 'block',
									displayText: `🔗 ${blockLine.trim().substring(0, 50)}... (${file.basename})`,
									linkText: `#^${blockId}`
								});
							}
						}
					});
				}
			}
		}

		// Sort by relevance (exact matches first, then partial matches)
		return suggestions.sort((a, b) => {
			const aExact = a.title.toLowerCase() === query;
			const bExact = b.title.toLowerCase() === query;
			if (aExact && !bExact) return -1;
			if (!aExact && bExact) return 1;
			return a.title.localeCompare(b.title);
		}).slice(0, 10); // Limit to 10 suggestions
	}

	renderSuggestion(suggestion: LinkSuggestion, el: HTMLElement): void {
		el.createEl('div', { text: suggestion.displayText });
	}

	selectSuggestion(suggestion: LinkSuggestion, evt: MouseEvent | KeyboardEvent): void {
		const editor = this.context?.editor;
		if (!editor) return;

		const cursor = editor.getCursor();
		const line = editor.getLine(cursor.line);
		const start = this.context?.start;
		const end = this.context?.end;

		if (start && end) {
			// Check if we're already in a link context [[
			const beforeStart = line.substring(0, start.ch);
			const isInLinkContext = beforeStart.endsWith('[[');
			
			let replacement: string;
			if (isInLinkContext) {
				// We're in [[ context, just insert the link text
				replacement = suggestion.linkText + ']]';
			} else {
				// We're not in link context, wrap with [[]]
				replacement = `[[${suggestion.linkText}]]`;
			}

			editor.replaceRange(replacement, start, end);
		}
	}
}

export default class AutoLinkerPlugin extends Plugin {
	private suggester: AutoLinkerSuggest;

	async onload() {
		console.log('Loading Auto Linker Plugin');

		this.suggester = new AutoLinkerSuggest(this);
		this.registerEditorSuggest(this.suggester);

		// Add settings tab
		this.addSettingTab(new AutoLinkerSettingTab(this.app, this));

		// Add command to manually trigger link suggestions
		this.addCommand({
			id: 'trigger-link-suggestions',
			name: 'Trigger link suggestions',
			editorCallback: (editor: Editor) => {
				// Force trigger the suggester
				const cursor = editor.getCursor();
				const line = editor.getLine(cursor.line);
				const beforeCursor = line.substring(0, cursor.ch);
				
				// Insert [[ to trigger suggestions if not already present
				if (!beforeCursor.endsWith('[[')) {
					editor.replaceRange('[[', cursor);
				}
			}
		});

		new Notice('Auto Linker Plugin loaded successfully!');
	}

	onunload() {
		console.log('Unloading Auto Linker Plugin');
	}
}

import { App, PluginSettingTab, Setting } from 'obsidian';

class AutoLinkerSettingTab extends PluginSettingTab {
	plugin: AutoLinkerPlugin;

	constructor(app: App, plugin: AutoLinkerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Auto Linker Settings' });

		new Setting(containerEl)
			.setName('Minimum query length')
			.setDesc('Minimum number of characters to trigger suggestions')
			.addSlider(slider => slider
				.setLimits(1, 5, 1)
				.setValue(2)
				.setDynamicTooltip()
			);

		new Setting(containerEl)
			.setName('Maximum suggestions')
			.setDesc('Maximum number of suggestions to show')
			.addSlider(slider => slider
				.setLimits(5, 20, 1)
				.setValue(10)
				.setDynamicTooltip()
			);

		containerEl.createEl('h3', { text: 'How to use' });
		containerEl.createEl('p', { text: '• Type [[ to trigger link suggestions' });
		containerEl.createEl('p', { text: '• Start typing any text to see auto-suggestions' });
		containerEl.createEl('p', { text: '• Use arrow keys to navigate and Enter to select' });
		containerEl.createEl('p', { text: '• Suggestions include note titles, headings, and blocks' });
	}
}