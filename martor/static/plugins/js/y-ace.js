/*!
 * https://github.com/bajrangCoder/y-ace
 * Licensed under MIT (https://opensource.org/licenses/MIT)
 */

import 'https://esm.sh/yjs';
import Ace from 'https://esm.sh/ace-builds';

/**
 * Mutual exclude for JavaScript.
 *
 * @module mutex
 */

/**
 * @callback mutex
 * @param {function():void} cb Only executed when this mutex is not in the current stack
 * @param {function():void} [elseCb] Executed when this mutex is in the current stack
 */

/**
 * Creates a mutual exclude function with the following property:
 *
 * ```js
 * const mutex = createMutex()
 * mutex(() => {
 *   // This function is immediately executed
 *   mutex(() => {
 *     // This function is not executed, as the mutex is already active.
 *   })
 * })
 * ```
 *
 * @return {mutex} A mutual exclude function
 * @public
 */
const createMutex = () => {
  let token = true;
  return (f, g) => {
    if (token) {
      token = false;
      try {
        f();
      } finally {
        token = true;
      }
    } else if (g !== undefined) {
      g();
    }
  }
};

/**
 * Common Math expressions.
 *
 * @module math
 */

const floor = Math.floor;

/**
 * Utility module to work with sets.
 *
 * @module set
 */

const create$1 = () => new Set();

/**
 * Utility module to work with Arrays.
 *
 * @module array
 */

/**
 * Transforms something array-like to an actual Array.
 *
 * @function
 * @template T
 * @param {ArrayLike<T>|Iterable<T>} arraylike
 * @return {T}
 */
const from = Array.from;

/**
 * Utility module to work with time.
 *
 * @module time
 */

/**
 * Return current unix time.
 *
 * @return {number}
 */
const getUnixTime = Date.now;

/**
 * Utility module to work with key-value stores.
 *
 * @module map
 */

/**
 * Creates a new Map instance.
 *
 * @function
 * @return {Map<any, any>}
 *
 * @function
 */
const create = () => new Map();

/**
 * Get map property. Create T if property is undefined and set T on map.
 *
 * ```js
 * const listeners = map.setIfUndefined(events, 'eventName', set.create)
 * listeners.add(listener)
 * ```
 *
 * @function
 * @template {Map<any, any>} MAP
 * @template {MAP extends Map<any,infer V> ? function():V : unknown} CF
 * @param {MAP} map
 * @param {MAP extends Map<infer K,any> ? K : unknown} key
 * @param {CF} createT
 * @return {ReturnType<CF>}
 */
const setIfUndefined = (map, key, createT) => {
  let set = map.get(key);
  if (set === undefined) {
    map.set(key, set = createT());
  }
  return set
};

/**
 * Observable class prototype.
 *
 * @module observable
 */

/* c8 ignore start */
/**
 * Handles named events.
 *
 * @deprecated
 * @template N
 */
class Observable {
  constructor () {
    /**
     * Some desc.
     * @type {Map<N, any>}
     */
    this._observers = create();
  }

  /**
   * @param {N} name
   * @param {function} f
   */
  on (name, f) {
    setIfUndefined(this._observers, name, create$1).add(f);
  }

  /**
   * @param {N} name
   * @param {function} f
   */
  once (name, f) {
    /**
     * @param  {...any} args
     */
    const _f = (...args) => {
      this.off(name, _f);
      f(...args);
    };
    this.on(name, _f);
  }

  /**
   * @param {N} name
   * @param {function} f
   */
  off (name, f) {
    const observers = this._observers.get(name);
    if (observers !== undefined) {
      observers.delete(f);
      if (observers.size === 0) {
        this._observers.delete(name);
      }
    }
  }

  /**
   * Emit a named event. All registered event listeners that listen to the
   * specified name will receive the event.
   *
   * @todo This should catch exceptions
   *
   * @param {N} name The event name.
   * @param {Array<any>} args The arguments that are applied to the event listener.
   */
  emit (name, args) {
    // copy all listeners to an array first to make sure that no event is emitted to listeners that are subscribed while the event handler is called.
    return from((this._observers.get(name) || create()).values()).forEach(f => f(...args))
  }

  destroy () {
    this._observers = create();
  }
}
/* c8 ignore end */

/**
 * Utility functions for working with EcmaScript objects.
 *
 * @module object
 */

/**
 * @param {Object<string,any>} obj
 */
const keys = Object.keys;

/**
 * @deprecated use object.size instead
 * @param {Object<string,any>} obj
 * @return {number}
 */
const length = obj => keys(obj).length;

/**
 * Calls `Object.prototype.hasOwnProperty`.
 *
 * @param {any} obj
 * @param {string|symbol} key
 * @return {boolean}
 */
const hasProperty = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const EqualityTraitSymbol = Symbol('Equality');

/**
 * @typedef {{ [EqualityTraitSymbol]:(other:EqualityTrait)=>boolean }} EqualityTrait
 */

/**
 * Common functions and function call helpers.
 *
 * @module function
 */

/* c8 ignore start */

/**
 * @param {any} a
 * @param {any} b
 * @return {boolean}
 */
const equalityDeep = (a, b) => {
  if (a === b) {
    return true
  }
  if (a == null || b == null || a.constructor !== b.constructor) {
    return false
  }
  if (a[EqualityTraitSymbol] != null) {
    return a[EqualityTraitSymbol](b)
  }
  switch (a.constructor) {
    case ArrayBuffer:
      a = new Uint8Array(a);
      b = new Uint8Array(b);
    // eslint-disable-next-line no-fallthrough
    case Uint8Array: {
      if (a.byteLength !== b.byteLength) {
        return false
      }
      for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
          return false
        }
      }
      break
    }
    case Set: {
      if (a.size !== b.size) {
        return false
      }
      for (const value of a) {
        if (!b.has(value)) {
          return false
        }
      }
      break
    }
    case Map: {
      if (a.size !== b.size) {
        return false
      }
      for (const key of a.keys()) {
        if (!b.has(key) || !equalityDeep(a.get(key), b.get(key))) {
          return false
        }
      }
      break
    }
    case Object:
      if (length(a) !== length(b)) {
        return false
      }
      for (const key in a) {
        if (!hasProperty(a, key) || !equalityDeep(a[key], b[key])) {
          return false
        }
      }
      break
    case Array:
      if (a.length !== b.length) {
        return false
      }
      for (let i = 0; i < a.length; i++) {
        if (!equalityDeep(a[i], b[i])) {
          return false
        }
      }
      break
    default:
      return false
  }
  return true
};

/**
 * @module awareness-protocol
 */

const outdatedTimeout = 30000;

/**
 * @typedef {Object} MetaClientState
 * @property {number} MetaClientState.clock
 * @property {number} MetaClientState.lastUpdated unix timestamp
 */

/**
 * The Awareness class implements a simple shared state protocol that can be used for non-persistent data like awareness information
 * (cursor, username, status, ..). Each client can update its own local state and listen to state changes of
 * remote clients. Every client may set a state of a remote peer to `null` to mark the client as offline.
 *
 * Each client is identified by a unique client id (something we borrow from `doc.clientID`). A client can override
 * its own state by propagating a message with an increasing timestamp (`clock`). If such a message is received, it is
 * applied if the known state of that client is older than the new state (`clock < newClock`). If a client thinks that
 * a remote client is offline, it may propagate a message with
 * `{ clock: currentClientClock, state: null, client: remoteClient }`. If such a
 * message is received, and the known clock of that client equals the received clock, it will override the state with `null`.
 *
 * Before a client disconnects, it should propagate a `null` state with an updated clock.
 *
 * Awareness states must be updated every 30 seconds. Otherwise the Awareness instance will delete the client state.
 *
 * @extends {Observable<string>}
 */
class Awareness extends Observable {
  /**
   * @param {Y.Doc} doc
   */
  constructor (doc) {
    super();
    this.doc = doc;
    /**
     * @type {number}
     */
    this.clientID = doc.clientID;
    /**
     * Maps from client id to client state
     * @type {Map<number, Object<string, any>>}
     */
    this.states = new Map();
    /**
     * @type {Map<number, MetaClientState>}
     */
    this.meta = new Map();
    this._checkInterval = /** @type {any} */ (setInterval(() => {
      const now = getUnixTime();
      if (this.getLocalState() !== null && (outdatedTimeout / 2 <= now - /** @type {{lastUpdated:number}} */ (this.meta.get(this.clientID)).lastUpdated)) {
        // renew local clock
        this.setLocalState(this.getLocalState());
      }
      /**
       * @type {Array<number>}
       */
      const remove = [];
      this.meta.forEach((meta, clientid) => {
        if (clientid !== this.clientID && outdatedTimeout <= now - meta.lastUpdated && this.states.has(clientid)) {
          remove.push(clientid);
        }
      });
      if (remove.length > 0) {
        removeAwarenessStates(this, remove, 'timeout');
      }
    }, floor(outdatedTimeout / 10)));
    doc.on('destroy', () => {
      this.destroy();
    });
    this.setLocalState({});
  }

  destroy () {
    this.emit('destroy', [this]);
    this.setLocalState(null);
    super.destroy();
    clearInterval(this._checkInterval);
  }

  /**
   * @return {Object<string,any>|null}
   */
  getLocalState () {
    return this.states.get(this.clientID) || null
  }

  /**
   * @param {Object<string,any>|null} state
   */
  setLocalState (state) {
    const clientID = this.clientID;
    const currLocalMeta = this.meta.get(clientID);
    const clock = currLocalMeta === undefined ? 0 : currLocalMeta.clock + 1;
    const prevState = this.states.get(clientID);
    if (state === null) {
      this.states.delete(clientID);
    } else {
      this.states.set(clientID, state);
    }
    this.meta.set(clientID, {
      clock,
      lastUpdated: getUnixTime()
    });
    const added = [];
    const updated = [];
    const filteredUpdated = [];
    const removed = [];
    if (state === null) {
      removed.push(clientID);
    } else if (prevState == null) {
      if (state != null) {
        added.push(clientID);
      }
    } else {
      updated.push(clientID);
      if (!equalityDeep(prevState, state)) {
        filteredUpdated.push(clientID);
      }
    }
    if (added.length > 0 || filteredUpdated.length > 0 || removed.length > 0) {
      this.emit('change', [{ added, updated: filteredUpdated, removed }, 'local']);
    }
    this.emit('update', [{ added, updated, removed }, 'local']);
  }

  /**
   * @param {string} field
   * @param {any} value
   */
  setLocalStateField (field, value) {
    const state = this.getLocalState();
    if (state !== null) {
      this.setLocalState({
        ...state,
        [field]: value
      });
    }
  }

  /**
   * @return {Map<number,Object<string,any>>}
   */
  getStates () {
    return this.states
  }
}

/**
 * Mark (remote) clients as inactive and remove them from the list of active peers.
 * This change will be propagated to remote clients.
 *
 * @param {Awareness} awareness
 * @param {Array<number>} clients
 * @param {any} origin
 */
const removeAwarenessStates = (awareness, clients, origin) => {
  const removed = [];
  for (let i = 0; i < clients.length; i++) {
    const clientID = clients[i];
    if (awareness.states.has(clientID)) {
      awareness.states.delete(clientID);
      if (clientID === awareness.clientID) {
        const curMeta = /** @type {MetaClientState} */ (awareness.meta.get(clientID));
        awareness.meta.set(clientID, {
          clock: curMeta.clock + 1,
          lastUpdated: getUnixTime()
        });
      }
      removed.push(clientID);
    }
  }
  if (removed.length > 0) {
    awareness.emit('change', [{ added: [], updated: [], removed }, origin]);
    awareness.emit('update', [{ added: [], updated: [], removed }, origin]);
  }
};

/**
 * Class to manage remote cursors and selections
 */
class AceCursors {
  /**
   * @param {ace.Ace.Editor} editor - The Ace editor instance
   * @param {Object} options - Configuration options
   */
  constructor(editor, options = {}) {
    this.editor = editor;
    this.editorId =
      this.editor.container.id ||
      `ace-editor-${Math.floor(Math.random() * 10000)}`;
    this.markers = {};
    this.styleElements = {};
    this.options = {
      cursorWidth: 2,
      selectionOpacity: 0.3,
      labelEnabled: true,
      ...options,
    };

    // Initialize marker container
    this.cursorMarker = {
      type: "frontMarker",
      clazz: "ace-collaboration-cursor",
      cursors: [],
      owner: this,

      /**
       * Update method that gets called by Ace for custom markers
       * @param {HTMLElement} html - The HTML element
       * @param {Object} markerLayer - The marker layer
       * @param {ace.Ace.EditSession} session - The editor session
       * @param {Object} config - Configuration object
       */
      update: function (html, markerLayer, session, config) {
        const startRow = config.firstRow;
        const endRow = config.lastRow;
        const cursors = this.cursors;

        // Find gutter width for proper positioning
        const aceGutter = document.querySelector(
          `#${this.owner.editorId} .ace_gutter`,
        );
        const gutterWidth =
          aceGutter instanceof HTMLElement ? aceGutter.offsetWidth : 0;

        for (const cursor of cursors) {
          // Skip local cursor
          if (cursor.isLocal) continue;

          if (cursor.row < startRow || cursor.row > endRow) {
            continue;
          }

          // Calculate cursor position on screen
          const screenPos = session.documentToScreenPosition(
            cursor.row,
            cursor.column,
          );
          const height = config.lineHeight;
          const width = config.characterWidth;
          const top = markerLayer.$getTop(screenPos.row, config)+10;
          const left =
            markerLayer.$padding + gutterWidth + screenPos.column * width;

          // Create or update cursor element
          let cursorEl = document.getElementById(
            `${this.owner.editorId}_cursor_${cursor.id}`,
          );

          if (!cursorEl) {
            cursorEl = document.createElement("div");
            cursorEl.id = `${this.owner.editorId}_cursor_${cursor.id}`;
            cursorEl.className = "ace-collaboration-cursor";

            if (this.owner.options.labelEnabled) {
              cursorEl.innerHTML = `
                <div class="cursor-label" style="
                  background: ${cursor.color};
                  color: ${this.owner.getContrastColor(cursor.color)};
                  position: absolute;
                  top: -1.8em;
                  white-space: nowrap;
                  border-radius: 3px;
                  padding: 1px 3px;
                  pointer-events: none;
                  font-size: 12px;
                  z-index: 1000;
                ">${cursor.name}</div>
              `;
            }

            this.owner.editor.container.appendChild(cursorEl);
          }

          // Update cursor position and style
          cursorEl.style.position = "absolute";
          cursorEl.style.height = `${height}px`;
          cursorEl.style.width = `${width}px`;
          cursorEl.style.top = `${top}px`;
          cursorEl.style.left = `${left}px`;
          cursorEl.style.borderLeft = `${this.owner.options.cursorWidth}px solid ${cursor.color}`;
          cursorEl.style.zIndex = "100";
          cursorEl.style.pointerEvents = "none";
        }
      },

      /**
       * Trigger a redraw of the cursor markers
       */
      redraw: function () {
        this.session._signal("changeFrontMarker");
      },
    };

    // Set session on the marker
    this.cursorMarker.session = this.editor.getSession();

    // Add dynamic marker to session
    this.editor.getSession().addDynamicMarker(this.cursorMarker, true);
  }

  /**
   * Get contrast color for cursor label (black or white based on background)
   * @param {string} hexColor - Hex color code
   * @returns {string} - Either black or white for optimal contrast
   */
  getContrastColor(hexColor) {
    // Convert hex to RGB
    let r, g, b;

    if (hexColor.startsWith("#")) {
      const hex = hexColor.slice(1);
      r = Number.parseInt(hex.slice(0, 2), 16);
      g = Number.parseInt(hex.slice(2, 4), 16);
      b = Number.parseInt(hex.slice(4, 6), 16);
    } else if (hexColor.startsWith("rgb")) {
      const match = hexColor.match(/\d+/g);
      if (match && match.length >= 3) {
        [r, g, b] = match.map(Number);
      } else {
        return "#000000";
      }
    } else {
      return "#000000";
    }

    // Calculate luminance - standard formula for perceived brightness
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return white for dark colors, black for light colors
    return luminance > 0.5 ? "#000000" : "#ffffff";
  }

  /**
   * Update or remove cursors based on awareness state
   * @param {Object|undefined} cursorState - The cursor state from awareness
   * @param {number} clientId - Client ID
   * @param {boolean} isLocal - Whether this is the local user
   */
  updateCursors(cursorState, clientId, isLocal = false) {
    // Remove existing cursor for this client
    this.cursorMarker.cursors = this.cursorMarker.cursors.filter(
      (c) => c.id !== clientId,
    );

    if (cursorState?.cursor) {
      const cursor = cursorState.cursor;
      const session = this.editor.getSession();
      const pos = session.doc.indexToPosition(cursor.pos);

      // Only add remote cursors to the list (if isLocal is false)
      if (!isLocal) {
        this.cursorMarker.cursors.push({
          row: pos.row,
          column: pos.column,
          color: cursor.color,
          id: cursor.id,
          name: cursor.name,
          isLocal,
        });
      }

      // Handle selection (don't show selection for local user)
      if (!isLocal) {
        this.updateSelection(cursor, clientId);
      } else {
        // Remove any existing selection for local user
        if (this.markers[clientId]) {
          session.removeMarker(this.markers[clientId]);
          delete this.markers[clientId];
        }
      }
    } else {
      // Clean up if cursor is removed
      this.removeUserElements(clientId);
    }
  }

  /**
   * Update selection marker for a remote user
   * @param {Object} cursor - Cursor data
   * @param {number} clientId - Client ID
   */
  updateSelection(cursor, clientId) {
    const session = this.editor.getSession();

    // Remove old selection if exists
    if (this.markers[clientId]) {
      session.removeMarker(this.markers[clientId]);
      delete this.markers[clientId];
    }

    // Add new selection if there is one
    if (cursor.sel && cursor.anchor !== cursor.head) {
      const Range = ace.require("ace/range").Range;
      const anchor = session.doc.indexToPosition(cursor.anchor);
      const head = session.doc.indexToPosition(cursor.head);

      // Create or update style for selection
      this.createSelectionStyle(cursor.id, cursor.color);

      // Add new selection marker
      this.markers[clientId] = session.addMarker(
        new Range(anchor.row, anchor.column, head.row, head.column),
        `selection-${cursor.id}`,
        "text",
      );
    }
  }

  /**
   * Create or update CSS for selection highlighting
   * @param {number} id - User ID
   * @param {string} color - Selection color
   */
  createSelectionStyle(id, color) {
    if (!this.styleElements[id]) {
      const style = document.createElement("style");
      style.type = "text/css";
      style.id = `style_${id}`;
      document.head.appendChild(style);
      this.styleElements[id] = style;
    }

    this.styleElements[id].innerHTML = `
      .selection-${id} {
        position: absolute;
        z-index: 20;
        opacity: ${this.options.selectionOpacity};
        background: ${color};
        pointer-events: none;
      }
    `;
  }

  /**
   * Remove user cursor and selection elements
   * @param {number} clientId - Client ID
   */
  removeUserElements(clientId) {
    // Remove cursor element
    const cursorEl = document.getElementById(
      `${this.editorId}_cursor_${clientId}`,
    );
    if (cursorEl?.parentNode) {
      cursorEl.parentNode.removeChild(cursorEl);
    }

    // Remove selection marker
    if (this.markers[clientId]) {
      this.editor.getSession().removeMarker(this.markers[clientId]);
      delete this.markers[clientId];
    }

    // Remove style element
    if (this.styleElements[clientId]) {
      document.head.removeChild(this.styleElements[clientId]);
      delete this.styleElements[clientId];
    }
  }

  /**
   * Clear all cursors and selections
   */
  clear() {
    // Remove all cursor elements
    for (const cursor of this.cursorMarker.cursors) {
      const cursorEl = document.getElementById(
        `${this.editorId}_cursor_${cursor.id}`,
      );
      if (cursorEl?.parentNode) {
        cursorEl.parentNode.removeChild(cursorEl);
      }
    }

    // Clear cursors array
    this.cursorMarker.cursors = [];

    // Remove all selection markers
    for (const id of Object.keys(this.markers)) {
      this.editor.getSession().removeMarker(this.markers[id]);
      delete this.markers[id];
    }

    // Remove all style elements
    for (const id of Object.keys(this.styleElements)) {
      if (this.styleElements[id].parentNode) {
        document.head.removeChild(this.styleElements[id]);
      }
      delete this.styleElements[id];
    }

    // Trigger redraw
    this.cursorMarker.redraw();
  }
}

/**
 * @module bindings/ace
 * @description Ace editor bindings for Yjs
 */

/**
 * Ace editor binding for Yjs with collaborative editing and awareness support
 */
class AceBinding {
  /**
   * @param {Y.Text} type - The Yjs Text type to bind to
   * @param {ace.Ace.Editor} editor - The Ace editor instance
   * @param {Awareness} [awareness] - The awareness instance for collaborative editing
   * @param {Object} [options] - Additional configuration options
   */
  constructor(type, editor, awareness, options = {}) {
    this.type = type;
    this.doc = /** @type {Y.Doc} */ (type.doc);
    this.editor = editor;
    this.awareness = awareness;
    this.options = {
      preserveUndoStack: false,
      colors: [
        "#f44336", // Red
        "#ff9800", // Orange
        "#ffeb3b", // Yellow
        "#4caf50", // Green
        "#2196f3", // Blue
        "#9c27b0", // Purple
        "#e91e63", // Pink
        "#00bcd4", // Cyan
        "#009688", // Teal
        "#795548", // Brown
        "#607d8b", // Blue Grey
      ],
      cursorWidth: 2,
      selectionOpacity: 0.3,
      labelEnabled: true,
      ...options,
    };

    // Create mutex to prevent concurrent updates
    this.mux = createMutex();

    // Setup Ace cursors
    this.aceCursors = new AceCursors(this.editor, {
      cursorWidth: this.options.cursorWidth,
      selectionOpacity: this.options.selectionOpacity,
      labelEnabled: this.options.labelEnabled,
    });

    // Reset Ace undo manager if not preserving
    if (!this.options.preserveUndoStack) {
      console.log(ace);
      this.editor.session.setUndoManager(new ace.UndoManager());
    }

    // Flag to track if we're applying external changes
    this._muxLocked = false;

    // Initialize from Yjs document
    this.initializeAceFromYjs();

    // Set up event observers
    this.setupEventObservers();
  }

  /**
   * Initialize Ace editor content from Yjs document
   */
  initializeAceFromYjs() {
    const content = this.type.toString();
    this.mux(() => {
      this._muxLocked = true;
      this.editor.setValue(content);
      this.editor.clearSelection();
      this.editor.moveCursorTo(0, 0);
      this._muxLocked = false;
    });
  }

  /**
   * Set up all event observers for Yjs and Ace
   */
  setupEventObservers() {
    // Observer for Yjs text changes
    this._typeObserver = (event) => {
      // Skip if we're applying changes from Ace to avoid loops
      if (this._muxLocked) return;

      this.mux(() => {
        this._muxLocked = true;
        this.applyYjsDeltaToAce(event.delta);
        this._muxLocked = false;
      });
    };
    this.type.observe(this._typeObserver);

    // Observer for Ace content changes
    this._aceObserver = (delta) => {
      if (this._muxLocked) return;

      this.mux(() => {
        this._muxLocked = true;
        this.applyAceDeltaToYjs(delta);
        this._muxLocked = false;
        this._aceObserver = (delta) => {
          this.updateCursorPosition();
        };
      });
    };
    this.editor.session.on("change", this._aceObserver);

    // Observer for cursor/selection changes
    this._selectionObserver = () => {
      this.updateCursorPosition();
    };
    this.editor.selection.on("changeCursor", this._selectionObserver);
    this.editor.selection.on("changeSelection", this._selectionObserver);

    // Observer for awareness changes (remote cursors)
    if (this.awareness) {
      this._awarenessObserver = ({ added, updated, removed }) => {
        const states = this.awareness?.getStates();
        const localClientId = this.doc.clientID;

        // Process all changes
        for (const id of [...added, ...updated]) {
          if (states) {
            this.aceCursors.updateCursors(
              states.get(id),
              id,
              id === localClientId,
            );
          }
        }

        // Handle removed clients
        for (const id of removed) {
          this.aceCursors.removeUserElements(id);
        }

        // Trigger redraw
        this.aceCursors.cursorMarker.redraw();
      };

      this.awareness.on("change", this._awarenessObserver);

      // Initial population of remote cursors
      const states = this.awareness.getStates();
      states.forEach((state, id) => {
        if (id !== this.doc.clientID && state.cursor) {
          this.aceCursors.updateCursors(state, id, false);
        }
      });
      this.aceCursors.cursorMarker.redraw();
    }
  }

  /**
   * Apply Yjs delta to Ace editor
   * @param {Array} delta - Yjs delta
   */
  applyYjsDeltaToAce(delta) {
    const aceDocument = this.editor.session.getDocument();
    const Range = ace.require("ace/range").Range;

    // Save current cursor and scroll position
    const cursorPosition = this.editor.getCursorPosition();
    const scrollTop = this.editor.session.getScrollTop();

    let currentPos = 0;

    for (const op of delta) {
      if (op.retain) {
        currentPos += op.retain;
      } else if (op.insert) {
        const start = aceDocument.indexToPosition(currentPos);
        aceDocument.insert(start, op.insert);
        currentPos += op.insert.length;
      } else if (op.delete) {
        const start = aceDocument.indexToPosition(currentPos);
        const end = aceDocument.indexToPosition(currentPos + op.delete);
        const range = new Range(start.row, start.column, end.row, end.column);
        aceDocument.remove(range);
      }
    }

    // Restore cursor and scroll position when appropriate
    try {
      this.editor.moveCursorToPosition(cursorPosition);
      this.editor.session.setScrollTop(scrollTop);
    } catch (e) {
      // Position might be invalid after changes, ignore
    }
  }

  /**
   * Apply Ace delta to Yjs
   * @param {Object} delta - Ace delta
   */
  applyAceDeltaToYjs(delta) {
    const aceDocument = this.editor.session.getDocument();

    if (delta.action === "insert") {
      const start = aceDocument.positionToIndex(delta.start);
      const text = delta.lines.join("\n");
      this.type.insert(start, text);
    } else if (delta.action === "remove") {
      const start = aceDocument.positionToIndex(delta.start);
      const length = delta.lines.join("\n").length;
      this.type.delete(start, length);
    }
  }

  /**
   * Update cursor position in awareness
   */
  updateCursorPosition() {
    if (!this.awareness) return;

    const localState = this.awareness.getLocalState() || {};
    const selection = this.editor.selection;
    const aceDocument = this.editor.session.getDocument();

    if (!selection) {
      if (localState.cursor) {
        this.awareness.setLocalStateField("cursor", null);
      }
      return;
    }

    // Get user data from awareness or create default
    const user = localState.user || {
      name: `User ${this.doc.clientID}`,
      color: this.getClientColor(this.doc.clientID),
      id: this.doc.clientID,
    };

    // Calculate cursor and selection
    const anchor = aceDocument.positionToIndex(selection.getSelectionAnchor());
    const head = aceDocument.positionToIndex(selection.getSelectionLead());

    // Create cursor object
    const cursor = {
      id: this.doc.clientID,
      name: user.name,
      color: user.color,
      anchor: Math.min(anchor, head),
      head: Math.max(anchor, head),
      pos: head,
      sel: anchor !== head,
    };

    // Update awareness only if cursor changed
    const currentCursor = localState.cursor;
    if (
      !currentCursor ||
      cursor.anchor !== currentCursor.anchor ||
      cursor.head !== currentCursor.head
    ) {
      this.awareness.setLocalStateField("cursor", cursor);
    }
  }

  /**
   * Get consistent color for a client based on their ID
   * @param {number} clientId - Client ID
   * @returns {string} - Color in hex format
   */
  getClientColor(clientId) {
    const { colors } = this.options;
    return colors[clientId % colors.length];
  }

  /**
   * Clean up all resources
   */
  destroy() {
    // Remove observers
    if (this._typeObserver) {
      this.type.unobserve(this._typeObserver);
    }
    this.editor.session.off("change", this._aceObserver);
    if (this._selectionObserver) {
      this.editor.selection.off("changeCursor", this._selectionObserver);
      this.editor.selection.off("changeSelection", this._selectionObserver);
    }

    if (this._awarenessObserver && this.awareness) {
      this.awareness.off("change", this._awarenessObserver);
    }

    // Clear cursors
    this.aceCursors.clear();

    // Clean up any remaining DOM elements
    const cursorElements = Array.from(
      document.querySelectorAll(`[id^="${this.aceCursors.editorId}_cursor_"]`),
    );
    for (const el of cursorElements) {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }

    const styleElements = Array.from(
      document.querySelectorAll(`style[id^="style_"]`),
    );
    for (const el of styleElements) {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }

    console.log("AceBinding destroyed successfully");
  }
}

/**
 * @param {Y.Text} yText
 * @param {ace.Ace.Editor} editor
 * @param {Awareness} [awareness]
 * @param {Object} [options]
 * @returns {AceBinding}
 */
function yCollab(yText, editor, awareness, options = {}) {
  return new AceBinding(yText, editor, awareness, options);
}

export { AceBinding, yCollab };
//# sourceMappingURL=y-ace.esm.js.map

