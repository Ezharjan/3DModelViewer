<template>
    <div class="browser">
        <!-- <h1>{{ msg }}</h1> -->
        <div id="container" class="renderer_area"></div>
        <div>
            <!-- <input type="file" id="files" @change="readLocalFile()" style="display:none" /> -->
            <input type="file" id="files" @change="readLocalFile()" />
            <button @click="increaseModelScale()">ScaleUp</button>
            <button @click="decreaseModelScale()">ScaleDown</button>
            <!-- <div align="center" style="margin: 15px"></div> -->
        </div>
        <div id="dat-gui" class="dat-area" style="marginTop: 15px"></div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
// import { readFile, readFileSync, writeFile, writeFileSync } from "fs";
// import { remote } from "electron";
import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import Loader from "../Loader";
import { Object3D, Color } from "three";
import * as dat from "dat.gui";

class DatGUI {
    moveSpeed: any;
    zoomSpeed: any;
    rotateSpeed: any;
    constructor() {
        this.moveSpeed = 1;
        this.zoomSpeed = 0.1;
        this.rotateSpeed = 1;
    }
}

const inputFuction = function() {
    const r = document.getElementById("files");
    return r;
};
const globalVueFunc: any = global;
globalVueFunc.getInputFunction = inputFuction;

@Component
export default class Browser extends Vue {
    @Prop() private msg!: string;

    // private db = remote.getGlobal("myDB");
    // private tcpServer = remote.getGlobal("myServer");

    // container: any = document.getElementById("container");

    // Menu = remote.Menu;
    // MenuItem = remote.MenuItem;

    private objFileContent: any;

    private loader = new Loader();

    camera: any;
    controls: any;
    scene: any;
    renderer: any;
    mouse = new THREE.Vector2();
    object: any;
    loadedModelHolder: Object3D;

    created() {
        // 何か処理
        // this.objFileContent = window
        //     .require("electron")
        //     .remote.getGlobal("objFileContent");
    }

    mounted() {
        // 何か処理
        this.initialize();
        this.startRecursion();
        console.log(window.document.getElementById("files"));
    }

    updated() {
        // 何か処理
    }

    destroyed() {
        // 何か処理
    }

    /* menu() {
        console.log("ssss");
        const menu = new this.Menu();
        menu.append(
            new this.MenuItem({
                label: "File",
                submenu: [
                    {
                        label: "Save",
                        click: () => {
                            console.log(":^^^^^^^^^^^^^666");
                        }
                    }
                ]
            })
        );
    } */

    sliderGUI() {
        const gui = new dat.GUI({ autoPlace: false });
        const customContainer = document.getElementById("dat-gui");
        customContainer.appendChild(gui.domElement);
        const silder = new DatGUI();
        const zoomSpeedController = gui
            .add(silder, "zoomSpeed", -10, 10)
            .step(0.1);
        const panSpeedController = gui
            .add(silder, "moveSpeed", -10, 20)
            .step(0.25);
        const rotateSpeedController = gui
            .add(silder, "rotateSpeed", -10, 22)
            .step(0.25);
        zoomSpeedController.onChange(value => {
            // Fires on every change, drag, keypress, etc.
            this.controls.zoomSpeed = value;
        });
        zoomSpeedController.onFinishChange(value => {
            // Fires when a controller loses focus.
            // alert("The new value is " + value);
        });
        panSpeedController.onChange(value => {
            // Fires on every change, drag, keypress, etc.
            this.controls.panSpeed = value;
        });
        panSpeedController.onFinishChange(value => {
            // Fires when a controller loses focus.
            // alert("The new value is " + value);
        });
        rotateSpeedController.onChange(value => {
            // Fires on every change, drag, keypress, etc.
            this.controls.rotateSpeed = value;
        });
        rotateSpeedController.onFinishChange(value => {
            // Fires when a controller loses focus.
            // alert("The new value is " + value);
        });
    }

    initialize() {
        this.sliderGUI();

        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            1,
            10000
        );

        this.camera.position.set(0, 0, 2);
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x056000);

        this.scene.add(new THREE.AmbientLight(0xfffff5));

        const light: any = new THREE.SpotLight(0xffffff, 1.5);
        // light.position.set(1003, 1002, 1002);
        light.position.set(1, 1, 1);
        this.scene.add(light);

        this.renderer = new THREE.WebGLRenderer({
            //将渲染保存到缓冲区，否则获取的图片会是空的
            preserveDrawingBuffer: true, //是否保留缓冲区直到手动清除或覆盖。默认值为false
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(779, 576);

        (document.getElementById("container") as HTMLDivElement).appendChild(
            this.renderer.domElement
        );

        this.controls = new TrackballControls(
            this.camera,
            this.renderer.domElement
        );
        this.controls.rotateSpeed = 1;
        this.controls.zoomSpeed = 0.1;
        this.controls.panSpeed = 1;
        this.controls.noZoom = false;
        this.controls.noPan = false;
        this.controls.staticMoving = true;
        this.controls.dynamicDampingFactor = 0.3;

        this.renderer.domElement.addEventListener("mousemove", (e: any) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    startRecursion() {
        requestAnimationFrame(this.startRecursion);
        const renderFrame = () => {
            this.controls.update();
            this.renderer.setRenderTarget(null);
            this.renderer.render(this.scene, this.camera); //Last important method to be called
            console.log("I am called");
        };
        // this.loadedModelHolder.rotation.x++;
        renderFrame();
    }

    readLocalFile() {
        const selectedFile = document.getElementById("files")["files"][0];
        if (selectedFile == undefined || selectedFile == null) {
            return;
        }
        const name = selectedFile.name; //读取选中文件的文件名
        const size = selectedFile.size; //读取选中文件的大小
        console.log("文件名:" + name + "大小:" + size);
        const fileExtension = name.substring(
            name.lastIndexOf(".") + 1,
            name.length
        );
        console.log(Object.keys(selectedFile));
        const reader = new FileReader(); //这是核心,读取操作就是由它完成.
        // reader.readAsText(selectedFile); //读取文件的内容,也可以读取文件的URL
        reader.readAsDataURL(selectedFile);
        reader.onload = () => {
            //当读取完成后回调这个函数,然后此时文件的内容存储到了result中,直接操作即可
            // console.log("Content: " + reader.result);
            this.objFileContent = this.dataURLToBlob(reader.result);
            console.log("fileExtension is: " + fileExtension);
            this.addModel(fileExtension);
        };
    }

    dataURLToBlob(dataurl) {
        console.log("datarul", dataurl);
        const arr = dataurl.split(",");
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    addModel(fileExtension: string) {
        const readableFile = new Blob([this.objFileContent]);

        // console.log("readableFile : " + readableFile);
        // console.log("origianleFile : " + this.objFileContent);

        // this.loader.parseFile(readableFile, "fbx", (loadedObject: Object3D) => {
        this.loader.parseFile(
            readableFile,
            fileExtension,
            (loadedObject: Object3D) => {
                this.scene.add(loadedObject);
                // console.log("loaded!" + Object.keys(loadedObject));
                loadedObject.position.set(0, 0, 0);
                loadedObject.scale.set(1, 1, 1);
                this.loadedModelHolder = loadedObject;
            }
        );
    }

    cssColorToHex(color: string) {
        return "0x" + (color as string).substring(2, color.length);
    }

    scaleCaptio = 1;
    increaseModelScale() {
        if (
            this.loadedModelHolder == undefined ||
            this.loadedModelHolder == null
        ) {
            alert("Please import a model file first!");
            return;
        }

        if (this.scaleCaptio > 100000) {
            return;
        }
        this.loadedModelHolder.scale.set(
            (this.scaleCaptio *= 10),
            this.scaleCaptio,
            this.scaleCaptio
        );
        console.log(this.scaleCaptio);
    }

    decreaseModelScale() {
        if (
            this.loadedModelHolder == undefined ||
            this.loadedModelHolder == null
        ) {
            alert("Please import a model file first!");
            return;
        }
        if (this.scaleCaptio < 0.00001) {
            return;
        }
        this.loadedModelHolder.scale.set(
            (this.scaleCaptio /= 10),
            this.scaleCaptio,
            this.scaleCaptio
        );
        console.log(this.scaleCaptio);
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
    margin: 40px 0 0;
}
ul {
    list-style-type: none;
    padding: 0;
}
li {
    display: inline-block;
    margin: 0 10px;
}
a {
    color: #42b983;
}

.render_area {
    margin: 90px 168px;
    height: 600px;
    width: 600px;
    float: left;
    box-sizing: border-box;
}
</style>
