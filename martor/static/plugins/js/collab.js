import * as Y from 'https://esm.sh/yjs';
import { WebsocketProvider  } from 'https://esm.sh/y-websocket';
import { AceBinding } from './y-ace.js';
import 'https://esm.sh/ace-builds/src-min-noconflict/mode-javascript.js';
import 'https://esm.sh/ace-builds/src-min-noconflict/theme-monokai.js';



function enable_collab(editorID) {
  console.log("enabling collab")
	var editor = ace.edit(editorID);
	//editor.setTheme('ace/theme/monokai')
    //editor.session.setMode('ace/mode/javascript')
	editor.collabEnabled = true;
	const ydoc = new Y.Doc()
	const provider = new WebsocketProvider('ws://jd-arch:1234', 'ws/test', ydoc)
	const type = ydoc.getText('ace')

	const binding = new AceBinding(type, editor, provider.awareness)
	let user = {
    name: Math.random().toString(36).substring(7),
    color: '#'+Math.floor(Math.random()*16777215).toString(16)
  }

  // Define user name and user name
  provider.awareness.setLocalStateField('user', user)

  provider.awareness.on('change', function(){
    let userCount = provider.awareness.getStates().size
    let userIcon = '👤 '
    if(userCount > 1){
      userIcon = '👥 '
    }
    document.getElementById('users').innerHTML = userIcon + userCount + ' users'
  })

  // provider.destroy()

  const connectBtn = document.getElementById('y-connect-btn')
  connectBtn.addEventListener('click', () => {
    if (provider.shouldConnect) {
      provider.disconnect()
      connectBtn.textContent = 'Connect'
    } else {
      provider.connect()
      connectBtn.textContent = 'Disconnect'
    }
  })

}

window.enable_collab=enable_collab;
