/*参照three.js editor代码进行修改
 *从文件中加载模型的类
 * by: Csj
 * 
 */
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import JSZip from 'jszip'
//import { Object3D } from 'three'
class Loader {
    texturePath: string;
    manager: any;

    constructor() {
        this.texturePath = '';
    }

    loadFiles(files, callback) {
        files.map((file) => {
            this.loadFile(file, callback);
        });
    }


    parseFile(file, extension, callback) {
        if (!file || !extension) {
            console.error('The file is ' + file +
                ' and the extension is ' + extension);
            return;
        }
        const reader = new FileReader();
        switch (extension) {
            case 'fbx':
                reader.addEventListener('load', function (event) {
                    const contents = event.target.result;
                    const loader = new FBXLoader();
                    const object = loader.parse(contents, "fbx");
                    if (callback)
                        callback(object);
                }, false);
                reader.readAsArrayBuffer(file);

                break;
            case 'obj':
                reader.addEventListener('load', (event) => {
                    const contents = event.target.result;
                    const object = new OBJLoader().parse(contents as string);
                    object.name = extension;
                    if (callback)
                        callback(object);
                    //this.editor.dosomething with object
                });
                reader.readAsText(file);
                break;
            case 'jpg':
            case 'jpeg':
            case 'png':
                reader.addEventListener('load', (event) => {
                    const contents = event.target.result;
                    new THREE.TextureLoader().load(contents as string, (texture) => {
                        if (callback) {
                            callback(texture);
                        }
                    });
                });
                reader.readAsDataURL(file);
                break;
            case 'json':
                reader.addEventListener('load', (event) => {
                    const contents = event.target.result;
                    const data = JSON.parse(contents as string);
                    this.handleJSON(data, callback);
                });
                reader.readAsText(file);
                break;
            case 'zip':
                reader.addEventListener('load', (event) => {
                    const contents = event.target.result;
                    this.handleZIP(contents, callback);
                });
                reader.readAsBinaryString(file);
                break;
            default:
                break;
        }
    }


    loadFile(file, callback) {
        if (!file)
            return;
        const filename = file.name;
        const extension = filename.split('.').pop().toLowerCase();
        const reader = new FileReader();
        reader.onprogress = (event) => {
            const size = '(' + Math.floor(event.total / 1000) + ' KB)';
            const progress = Math.floor((event.loaded / event.total) * 100) + '%';
            console.log('Loading', filename, size, progress);
        };
        switch (extension) {
            case 'fbx':
                reader.addEventListener('load', function (event) {
                    const contents = event.target.result;
                    const loader = new FBXLoader();
                    const object = loader.parse(contents as string, "fbx");
                    if (callback)
                        callback(object);
                }, false);
                reader.readAsArrayBuffer(file);

                break;
            case 'obj':
                reader.addEventListener('load', (event) => {
                    const contents = event.target.result;
                    const object = new OBJLoader().parse(contents as string);
                    object.name = filename;
                    if (callback)
                        callback(object);
                    //this.editor.dosomething with object
                });
                reader.readAsText(file);
                break;
            case 'jpg':
            case 'jpeg':
            case 'png':
                reader.addEventListener('load', (event) => {
                    const contents = event.target.result;
                    new THREE.TextureLoader().load(contents as string, (texture) => {
                        if (callback) {
                            callback(texture);
                        }
                    });
                });
                reader.readAsDataURL(file);
                break;
            case 'json':
                reader.addEventListener('load', (event) => {
                    const contents = event.target.result;
                    const data = JSON.parse(contents as string);
                    this.handleJSON(data, callback);
                });
                reader.readAsText(file);
                break;
            case 'zip':
                reader.addEventListener('load', (event) => {
                    const contents = event.target.result;
                    this.handleZIP(contents, callback);
                });
                reader.readAsBinaryString(file);
                break;
            default:
                break;
        }
    }
    handleJSON(data, callback) {
        if (!data)
            return;
        if (data.metadata === undefined) { // 2.0
            data.metadata = { type: 'Geometry' };
        }

        if (data.metadata.type === undefined) { // 3.0
            data.metadata.type = 'Geometry';
        }

        if (data.metadata.formatVersion !== undefined) {
            data.metadata.version = data.metadata.formatVersion;
        }

        switch (data.metadata.type.toLowerCase()) {
            case 'buffergeometry':
                {
                    const loader = new THREE.BufferGeometryLoader();
                    const result = loader.parse(data);
                    const mesh = new THREE.Mesh(result);
                    if (callback)
                        callback(mesh);
                }
                break;

            case 'geometry':
                console.error('Loader: "Geometry" is no longer supported.');
                break;

            case 'object':
                {
                    const loader = new THREE.ObjectLoader();
                    loader.setResourcePath(this.texturePath);
                    loader.parse(data, function (result) {
                        if (callback)
                            callback(result);
                    });
                }
                break;
        }
    }

    handleZIP(data, callback) {

        JSZip.loadAsync(data)
            .then((zip) => {
                //
                this.decodeZipFiles(zip, callback);

            }, (e) => {
                alert('Zip 读取出错，请检查' + e);
            });
    }
    async decodeZipFiles(zip, callback) {
        const texturesMap = {}
        let materialFile = null;
        let objFile = null;

        await zip.files['materials.mtl'].async("string").then((file) => {
            materialFile = file;
        });
        await zip.files['model.obj'].async("string").then((file) => {
            objFile = file;
        });
        for (const fileName in zip.files) {
            const extension = fileName.split('.').pop().toLowerCase();
            if (extension == 'jpg' || extension == 'png' || extension == 'jpeg') {
                await zip.files[fileName].async("base64").then((file) => {
                    const imgdata = 'data:image/jpeg;base64,' + file;
                    texturesMap[fileName] = new THREE.TextureLoader().load(imgdata);
                });
            }
        }
        if (objFile && materialFile) {
            const mtlloader: any = new MTLLoader().parse(materialFile as string, "");

            const object = new OBJLoader().setMaterials(mtlloader).parse(objFile);
            if (object) {
                for (const minfo in mtlloader.materialsInfo) {
                    const mapKd = mtlloader.materialsInfo[minfo]['map_kd'];
                    if (texturesMap[mapKd] && mtlloader.materials[minfo]) {
                        mtlloader.materials[minfo].map = texturesMap[mapKd];
                    }
                }
                callback(object);
            }
        } else {
            alert('请确保Zip中含有 model.obj 和 materials.mtl 文件');
        }
    }
}

export default Loader;