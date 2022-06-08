import * as THREE from "@/assets/threejs/build/three.module.js";
import { RemoveObjectCommand } from "@/assets/threejs/commands/RemoveObjectCommand.js";
import { Editor } from "@/assets/threejs/js/Editor.js";
import { Menubar } from "@/assets/threejs/js/Menubar.js";
import { Player } from "@/assets/threejs/js/Player.js";
import { Resizer } from "@/assets/threejs/js/Resizer.js";
import { Script } from "@/assets/threejs/js/Script.js";
import { Sidebar } from "@/assets/threejs/js/Sidebar.js";
import { Toolbar } from "@/assets/threejs/js/Toolbar.js";
import { Viewport } from "@/assets/threejs/js/Viewport.js";
import { VRButton } from "@/assets/threejs/jsm/webxr/VRButton.js";

function EditorPage() {
  const editor = new Editor();
  const { signals } = editor;
  let isLoadingFromHash = false;
  const { hash } = window.location;

  window.URL = window.URL || window.webkitURL;
  window.BlobBuilder =
    window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

  window.THREE = THREE;

  window.editor = editor; // Expose editor to Console
  window.THREE = THREE; // Expose THREE to APP Scripts and Console
  window.VRButton = VRButton; // Expose VRButton to APP Scripts

  const viewport = Viewport(editor);
  document.body.appendChild(viewport.dom);

  const toolbar = Toolbar(editor);
  document.body.appendChild(toolbar.dom);

  const script = Script(editor);
  document.body.appendChild(script.dom);

  const player = Player(editor);
  document.body.appendChild(player.dom);

  const sidebar = Sidebar(editor);
  document.body.appendChild(sidebar.dom);

  const menubar = Menubar(editor);
  document.body.appendChild(menubar.dom);

  const resizer = Resizer(editor);
  document.body.appendChild(resizer.dom);

  editor.storage.init(function () {
    editor.storage.get(async function (state: any) {
      if (isLoadingFromHash) return;

      if (state !== undefined) {
        await editor.fromJSON(state);
      } else {
        // 초기 저장된 indexdb 데이터 없는 경우 초기 프로젝트 세팅
        editor.clear();
      }

      const selected = editor.config.getKey("selected");

      if (selected !== undefined) {
        editor.selectByUuid(selected);
      }
    });

    //

    let timeout: any;

    function saveState() {
      if (editor.config.getKey("autosave") === false) {
        return;
      }

      clearTimeout(timeout);

      timeout = setTimeout(async function () {
        editor.signals.savingStarted.dispatch();
        await editor.storage.set(editor.toJSON());
        editor.signals.savingFinished.dispatch();
      }, 1000);
    }

    signals.geometryChanged.add(saveState);
    signals.objectAdded.add(saveState);
    signals.objectChanged.add(saveState);
    signals.objectRemoved.add(saveState);
    signals.materialChanged.add(saveState);
    signals.sceneBackgroundChanged.add(saveState);
    signals.sceneEnvironmentChanged.add(saveState);
    signals.sceneFogChanged.add(saveState);
    signals.sceneGraphChanged.add(saveState);
    signals.scriptChanged.add(saveState);
    signals.historyChanged.add(saveState);
  });

  document.addEventListener("dragover", (event: DragEvent) => {
    event.preventDefault();
    const dataTransfer = event.dataTransfer as DataTransfer;
    dataTransfer.dropEffect = "copy";
  });

  document.addEventListener("drop", (event: DragEvent) => {
    event.preventDefault();
    const dataTransfer = event.dataTransfer as DataTransfer;

    if (dataTransfer.types[0] === "text/plain") return; // Outliner drop

    if (dataTransfer.items) {
      // DataTransferItemList supports folders

      editor.loader.loadItemList(dataTransfer.items);
    } else {
      editor.loader.loadFiles(dataTransfer.files);
    }
  });

  function onWindowResize() {
    editor.signals.windowResize.dispatch();
  }

  window.addEventListener("resize", onWindowResize);

  onWindowResize();

  if (hash.slice(1, 6) === "file=") {
    const file = hash.slice(6);

    if (window.confirm("Any unsaved data will be lost. Are you sure?")) {
      const loader = new THREE.FileLoader();
      loader.crossOrigin = "";
      loader.load(file, (text: any) => {
        editor.clear();
        editor.fromJSON(JSON.parse(text));
      });

      isLoadingFromHash = true;
    }
  }

  // ServiceWorker
  if ("serviceWorker" in navigator) {
    try {
      navigator.serviceWorker.register("sw.js");
    } catch (error) {
      console.error(error);
    }
  }

  return <div>Editor</div>;
}

export default EditorPage;
