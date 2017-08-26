module pl {

	export class Modal {

		/**
		 * Overlay element.
		 * @type {HTMLElement}
		 */
		private _overlay: HTMLElement;

		/**
		 * Modal element.
		 * @type {HTMLElement}
		 */
		private _modal: HTMLElement;

		/**
		 * Modal content.
		 * @type {HTMLElement}
		 */
		private _content: HTMLElement;

		/**
		 * Close button element.
		 * @type {HTMLElement}
		 */
		private _closeButton: HTMLElement;

        /**
         * Flag that indicate if the modal is open or not.
         * @type {boolean}
         */
        private _isOpen: boolean = false;

		/**
		 * Modal close event.
		 * @type {PLEvent}
		 */
		private _modalClose: PLEvent;

        /**
         * Modal open event.
         * @type {PLEvent}
         */
        private _modalOpen: PLEvent;

		/**
		 * Modal settings
		 * @type {object}
		 */
		private _settings: Object;

		/**
		 * Transitionend name.
		 * @type {string}
		 */
		private _transitionend: string;

		/**
		 * Get transitionend event depending of the browser.
		 * @return {string}
		 */
		static transitionSelect(): string {
			let el = document.createElement('div');

			let transEndEventNames = {
				WebkitTransition : 'webkitTransitionEnd',
				MozTransition    : 'transitionend',
				OTransition      : 'otransitionend',
				transition       : 'transitionend'
			};

			for (let name in transEndEventNames) {
				if (el.style[name] !== undefined)
					return transEndEventNames[name];
			}
		};

		/**
		 * Utility method to extend defaults with user settings
		 * @param {object} source
		 * @param {object} settings
		 * @return {object}
		 */
		static extendsDefaults(source: Object, settings: Object) {
			let property;

			for (property in settings) {
				if (settings.hasOwnProperty(property))
					source[property] = settings[property];
			}

			return source;
		}

		/**
		 * Create an instance of Modal.
		 * @constructor
		 * @param {object} settings
		 */
		constructor(settings: Object) {
			// Define default options.
			let defaults = {
				className: '',
				avoidClose: true
			};

			// Create settings by extending defaults with passed
			// settings in constructor.
			this._settings = Modal.extendsDefaults(defaults, settings || {});

			// Select transitionend that browser support.
			this._transitionend = Modal.transitionSelect();

			this.buildOut();
			this.initializeEvents();
		}

		/**
		 * Create modal elements.
		 */
		private buildOut() {
			// Create overlay element.
			this._overlay = document.createElement('div');
			this._overlay.className = 'pl-modal-overlay';

			// Create modal element.
			this._modal = document.createElement('div');
			this._modal.className = 'pl-modal' + ' ' + this._settings['className'];

			// Create modal content.
			this._content = document.createElement('div');
			this._content.className = 'pl-modal-content';
			this._modal.appendChild(this._content);

			// Create close button element.
			if (this._settings['avoidClose']) {
				this._closeButton = document.createElement('div');
				this._closeButton.className = 'pl-modal-close-button';
				this._modal.appendChild(this._closeButton);
			}

		}

		/**
		 * Attach handlers to modal elements.
		 */
		private initializeEvents() {
            if (this._settings['avoidClose']) {
				let ESC_KEY = 27;

				// Close modal if user press esc key.
				document.addEventListener('keydown', ev => {
					if (ev.keyCode == ESC_KEY) this.close();
				}, false);

				// Close modal if user clicks the close button.
				this._closeButton.addEventListener('click', ev => {
					this.close();
				}, false);
			}

			// Bind "this" context to toggleTransition handler.
			this.toggleTransitionend = this.toggleTransitionend.bind(this);

			// Attach handler to transitionend event, when the event occurs for the first time
			// remove the event because transitionend handler will execute the same times as
			// styles modified.
			this._modal.addEventListener(this._transitionend, this.toggleTransitionend, false);

		}

        /**
         * Fires when modal open.
         */
        private onModalOpen() {
            if (this._modalOpen) {
                this._modalOpen.fire();
            }

            this._isOpen = true;
        }

        /**
         * Fires when modal closes.
         */
        private onModalClose() {
            if (this._modalClose) {
                this._modalClose.fire();
            }

            this.removeFromDom();

            this._isOpen = false;
        }

		/**
		 * Remove elements from DOM.
		 */
		private removeFromDom() {
			let overlay = this._overlay;
			let modal   = this._modal;

			overlay.parentNode.removeChild(overlay);
			modal.parentNode.removeChild(modal);
		}

		/**
		 * Control the flow of transitionend handler and modal.
		 * @param {TransitionEvent} ev
		 */
		private toggleTransitionend(ev: TransitionEvent) {
			let modal = this._modal,
				functionToCall = this._isOpen ? this.onModalClose : this.onModalOpen;

			modal.removeEventListener(this._transitionend, this.toggleTransitionend);
			functionToCall.call(this);

			setTimeout(() => {
				modal.addEventListener(this._transitionend, this.toggleTransitionend, false);
			}, 50);

		}

		/**
		 * Close modal and remove from DOM.
		 */
		public close() {
			if (!this._isOpen) return;

			let overlay = this._overlay;
			let modal   = this._modal;

			overlay.className = overlay.className.replace(/(\s+)?modal-open/, '');
			modal.className = modal.className.replace(/(\s+)?modal-open/, '');

		}

        /**
         * Get modal close event.
         * @return {PLEvent}
         */
        public get modalClose() {
            if (!this._modalClose) {
                this._modalClose = new PLEvent();
            }

            return this._modalClose;
        }

        /**
         * Get modal open event.
         * @return {PLEvent}
         */
        public get modalOpen() {
            if (!this._modalOpen) {
                this._modalOpen = new PLEvent();
            }

            return this._modalOpen;
        }

		/**
		 * Add modal to DOM and show it.
		 */
		public open() {
			if (this._isOpen) return;

            let body    = document.body;
			let	overlay = this._overlay;
			let	modal   = this._modal;

			body.appendChild(overlay);
			body.appendChild(modal);

			// Force the browser to recognize the elements that we just added.
			window.getComputedStyle(overlay).backgroundColor;
			window.getComputedStyle(modal).height;

			overlay.className += ' modal-open';
			modal.className += ' modal-open';

		}

		/**
		 * Set modal content.
		 * @param {HTMLElement|string} content
		 */
		public setContent(content: any = "") {
			// Empty content element.
			this._content.innerHTML = '';

			if ("string" === typeof content)
				this._content.appendChild( document.createTextNode(content) );
			else
				this._content.appendChild(content);

		}

	}

}