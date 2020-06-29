<template>
    <div class="browser">
        <!-- <h1>{{ msg }}</h1> -->
        <div id="container" class="renderer_area"></div>
        <input type="file" id="files" @change="ReadLocalFile()" />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
// import { readFile, readFileSync, writeFile, writeFileSync } from "fs";
import { remote } from "electron";
import * as THREE from "three";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import Loader from "../Loader";
import { Object3D } from "three";

@Component
export default class Browser extends Vue {
    @Prop() private msg!: string;

    // private db = remote.getGlobal("myDB");
    // private tcpServer = remote.getGlobal("myServer");

    // container: any = document.getElementById("container");

    private objFileContent: any;

    private loader = new Loader();

    camera: any;
    controls: any;
    scene: any;
    renderer: any;
    mouse = new THREE.Vector2();
    object: any;

    created() {
        // 何か処理
        this.objFileContent = window
            .require("electron")
            .remote.getGlobal("objFileContent");
    }

    mounted() {
        // 何か処理
        this.initialize();
        this.interaction();
        this.Start();
    }

    updated() {
        // 何か処理
    }

    destroyed() {
        // 何か処理
    }

    ReadLocalFile() {
        const selectedFile = document.getElementById("files")["files"][0];
        const name = selectedFile.name; //读取选中文件的文件名
        const size = selectedFile.size; //读取选中文件的大小
        console.log("文件名:" + name + "大小:" + size);
        console.log(Object.keys(selectedFile));
        const reader = new FileReader(); //这是核心,读取操作就是由它完成.
        // reader.readAsText(selectedFile); //读取文件的内容,也可以读取文件的URL
        reader.readAsDataURL(selectedFile);
        reader.onload = function() {
            //当读取完成后回调这个函数,然后此时文件的内容存储到了result中,直接操作即可
            console.log("Content: " + this.result);
        };
    }

    initialize() {
        // this.camera = new THREE.PerspectiveCamera(
        //     70,
        //     window.innerWidth / window.innerHeight,
        //     1,
        //     10000
        // );
        // this.camera = new THREE.PerspectiveCamera(50, 1, 0.01, 1000);
        this.camera = new THREE.PerspectiveCamera(70, 1, 0.01, 10000);

        // this.camera.position.x = 1000;
        // this.camera.position.y = 1000;
        // this.camera.position.z = 1000;
        // this.camera.position.set(0, 5, 10);
        this.camera.position.set(0, 0, 2);
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x056000);

        this.scene.add(new THREE.AmbientLight(0xfffff5));

        const light: any = new THREE.SpotLight(0xffffff, 1.5);
        // light.position.set(1003, 1002, 1002);
        light.position.set(5, 10, 7.5);
        this.scene.add(light);

        const readableFile = new Blob([this.objFileContent]);

        // console.log("readableFile : " + readableFile);
        // console.log("origianleFile : " + this.objFileContent);

        this.loader.parseFile(readableFile, "obj", function(
            loadedObject: Object3D
        ) {
            console.log("loaded!" + Object.keys(loadedObject));
            loadedObject.position.set(0, 0, 0);
            loadedObject.scale.set(1, 1, 1);
            // console.log(loadedObject.type);
        });

        this.renderer = new THREE.WebGLRenderer({
            //将渲染保存到缓冲区，否则获取的图片会是空的
            preserveDrawingBuffer: false, //是否保留缓冲区直到手动清除或覆盖。默认值为false
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(779, 576);

        (document.getElementById("container") as HTMLDivElement).appendChild(
            this.renderer.domElement
        );
    }

    interaction() {
        this.controls = new TrackballControls(
            this.camera,
            this.renderer.domElement
        );
        this.controls.rotateSpeed = 0.01;
        this.controls.zoomSpeed = 0.001;
        this.controls.panSpeed = 0.01;
        this.controls.noZoom = false;
        this.controls.noPan = false;
        this.controls.staticMoving = true;
        this.controls.dynamicDampingFactor = 0.3;

        this.renderer.domElement.addEventListener("mousemove", (e: any) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }
    Start() {
        const renderFrame = () => {
            this.controls.update();
            this.renderer.setRenderTarget(null);
            this.renderer.render(this.scene, this.camera);
            console.log("I am called");
        };
        renderFrame();
        requestAnimationFrame(this.Start);
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
