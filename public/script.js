class NotepadApp {
    constructor() {
        this.editor = document.getElementById('editor');
        this.customExtensionInput = document.getElementById('customExtension');
        this.checkExtensionBtn = document.getElementById('checkExtension');
        this.extensionStatus = document.getElementById('extensionStatus');
        this.saveNoteBtn = document.getElementById('saveNote');
        this.clearNoteBtn = document.getElementById('clearNote');
        this.shareSection = document.getElementById('shareSection');
        this.shareLink = document.getElementById('shareLink');
        this.copyLinkBtn = document.getElementById('copyLink');
        this.openLinkBtn = document.getElementById('openLink');
        this.newNoteBtn = document.getElementById('newNote');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.toast = document.getElementById('toast');
        
        this.currentNoteId = null;
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadNoteFromURL();
        this.setupToolbar();
        this.setupAutoSave();
    }
    
    setupEventListeners() {
        // Save note
        this.saveNoteBtn.addEventListener('click', () => this.saveNote());
        
        // Clear note
        this.clearNoteBtn.addEventListener('click', () => this.clearNote());
        
        // Check custom extension
        this.checkExtensionBtn.addEventListener('click', () => this.checkCustomExtension());
        this.customExtensionInput.addEventListener('input', () => this.validateCustomExtension());
        
        // Share actions
        this.copyLinkBtn.addEventListener('click', () => this.copyToClipboard());
        this.openLinkBtn.addEventListener('click', () => this.openShareLink());
        this.newNoteBtn.addEventListener('click', () => this.createNewNote());
        
        // Editor events
        this.editor.addEventListener('input', () => this.handleEditorChange());
        this.editor.addEventListener('paste', (e) => this.handlePaste(e));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }
    
    setupToolbar() {
        const toolbarButtons = document.querySelectorAll('.toolbar-btn');
        toolbarButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.dataset.command;
                this.executeCommand(command);
                this.updateToolbarState();
            });
        });
        
        // Font family change
        document.getElementById('fontFamily').addEventListener('change', (e) => {
            this.executeCommand('fontName', e.target.value);
        });
        
        // Font size change
        document.getElementById('fontSize').addEventListener('change', (e) => {
            this.executeCommand('fontSize', e.target.value);
        });
        
        // Text color change
        document.getElementById('textColor').addEventListener('change', (e) => {
            this.executeCommand('foreColor', e.target.value);
        });
        
        // Background color change
        document.getElementById('bgColor').addEventListener('change', (e) => {
            this.executeCommand('hiliteColor', e.target.value);
        });
    }
    
    executeCommand(command, value = null) {
        document.execCommand(command, false, value);
        this.editor.focus();
    }
    
    updateToolbarState() {
        const buttons = document.querySelectorAll('.toolbar-btn');
        buttons.forEach(btn => {
            const command = btn.dataset.command;
            const isActive = document.queryCommandState(command);
            btn.classList.toggle('active', isActive);
        });
    }
    
    handleEditorChange() {
        this.updateToolbarState();
        
        // Auto-save for existing notes
        if (this.currentNoteId) {
            this.debounceAutoSave();
        }
    }
    
    debounceAutoSave() {
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            if (this.currentNoteId) {
                this.autoSave();
            }
        }, 2000);
    }
    
    autoSave() {
        const content = this.editor.innerHTML;
        if (content.trim() === '') return;
        
        fetch(`/api/notes/${this.currentNoteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: content })
        }).catch(error => {
            console.log('Auto-save failed:', error);
        });
    }
    
    async saveNote() {
        if (this.isLoading) return;
        
        const content = this.editor.innerHTML;
        if (content.trim() === '' && !this.editor.textContent.trim()) {
            this.showToast('Scrie ceva înainte să salvezi!', 'error');
            return;
        }
        
        this.showLoading(true);
        
        try {
            const customExtension = this.customExtensionInput.value.trim();
            
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    content: content,
                    customExtension: customExtension 
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.currentNoteId = result.noteId;
                this.shareLink.value = result.url;
                this.showShareSection();
                this.showToast('Nota a fost salvată cu succes!', 'success');
                
                // Update URL without reload
                const newUrl = `/note/${result.noteId}`;
                window.history.pushState({}, '', newUrl);
            } else {
                throw new Error(result.error || 'Eroare la salvare');
            }
        } catch (error) {
            console.error('Save error:', error);
            this.showToast('Eroare la salvare: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async loadNoteFromURL() {
        const path = window.location.pathname;
        const match = path.match(/\/note\/(.+)/);
        
        if (match) {
            const noteId = match[1];
            await this.loadNote(noteId);
        }
    }
    
    async loadNote(noteId) {
        this.showLoading(true);
        
        try {
            const response = await fetch(`/api/notes/${noteId}`);
            const result = await response.json();
            
            if (result.success) {
                this.currentNoteId = noteId;
                this.editor.innerHTML = result.note.content;
                this.shareLink.value = `${window.location.origin}/note/${noteId}`;
                this.showShareSection();
                this.showToast('Nota a fost încărcată!', 'success');
            } else {
                throw new Error(result.error || 'Nota nu a fost găsită');
            }
        } catch (error) {
            console.error('Load error:', error);
            this.showToast('Eroare la încărcare: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    async checkCustomExtension() {
        const extension = this.customExtensionInput.value.trim();
        if (!extension) {
            this.extensionStatus.textContent = '';
            return;
        }
        
        this.extensionStatus.textContent = 'Se verifică...';
        this.extensionStatus.className = 'extension-status checking';
        
        try {
            const response = await fetch(`/api/check/${extension}`);
            const result = await response.json();
            
            if (result.success) {
                if (result.available) {
                    this.extensionStatus.textContent = '✓ Disponibil';
                    this.extensionStatus.className = 'extension-status available';
                } else {
                    this.extensionStatus.textContent = '✗ Deja folosit';
                    this.extensionStatus.className = 'extension-status taken';
                }
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.extensionStatus.textContent = 'Eroare la verificare';
            this.extensionStatus.className = 'extension-status taken';
        }
    }
    
    validateCustomExtension() {
        const extension = this.customExtensionInput.value;
        const cleanExtension = extension.toLowerCase().replace(/[^a-z0-9-_]/g, '');
        
        if (extension !== cleanExtension) {
            this.customExtensionInput.value = cleanExtension;
        }
        
        // Clear status when typing
        this.extensionStatus.textContent = '';
        this.extensionStatus.className = 'extension-status';
    }
    
    clearNote() {
        if (confirm('Ești sigur că vrei să ștergi tot conținutul?')) {
            this.editor.innerHTML = '';
            this.customExtensionInput.value = '';
            this.extensionStatus.textContent = '';
            this.extensionStatus.className = 'extension-status';
            this.hideShareSection();
            this.currentNoteId = null;
            this.editor.focus();
            
            // Reset URL
            window.history.pushState({}, '', '/');
        }
    }
    
    createNewNote() {
        this.clearNote();
    }
    
    showShareSection() {
        this.shareSection.classList.remove('hidden');
    }
    
    hideShareSection() {
        this.shareSection.classList.add('hidden');
    }
    
    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.shareLink.value);
            this.showToast('Link copiat în clipboard!', 'success');
        } catch (error) {
            // Fallback for older browsers
            this.shareLink.select();
            document.execCommand('copy');
            this.showToast('Link copiat în clipboard!', 'success');
        }
    }
    
    openShareLink() {
        window.open(this.shareLink.value, '_blank');
    }
    
    handlePaste(e) {
        // Clean up pasted content
        setTimeout(() => {
            const cleanContent = this.cleanHTML(this.editor.innerHTML);
            this.editor.innerHTML = cleanContent;
        }, 0);
    }
    
    cleanHTML(html) {
        // Remove unnecessary attributes and tags
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Remove style attributes that might cause issues
        const elements = temp.querySelectorAll('*');
        elements.forEach(el => {
            if (el.style && el.style.fontSize) {
                // Keep font-size but clean other styles
                const fontSize = el.style.fontSize;
                el.removeAttribute('style');
                if (fontSize) {
                    el.style.fontSize = fontSize;
                }
            }
        });
        
        return temp.innerHTML;
    }
    
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.saveNote();
        }
        
        // Ctrl/Cmd + N for new note
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.createNewNote();
        }
    }
    
    showLoading(show) {
        this.isLoading = show;
        if (show) {
            this.loadingOverlay.classList.remove('hidden');
        } else {
            this.loadingOverlay.classList.add('hidden');
        }
    }
    
    showToast(message, type = 'info') {
        const toast = this.toast;
        const toastMessage = toast.querySelector('.toast-message');
        const toastIcon = toast.querySelector('.toast-icon');
        
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        
        // Set icon based on type
        if (type === 'success') {
            toastIcon.className = 'toast-icon fas fa-check-circle';
        } else if (type === 'error') {
            toastIcon.className = 'toast-icon fas fa-exclamation-circle';
        } else {
            toastIcon.className = 'toast-icon fas fa-info-circle';
        }
        
        toast.classList.remove('hidden');
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 300);
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NotepadApp();
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    const app = window.notepadApp || new NotepadApp();
    app.loadNoteFromURL();
});
