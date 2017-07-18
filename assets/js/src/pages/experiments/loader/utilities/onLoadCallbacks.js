import * as THREE from 'three';

import Loaders from './Loaders.js';

import loaderCanvas from 'pages/experiments/loader/LoaderCanvas.js';

const loaders = new Loaders();
const defaultMat = new THREE.MeshBasicMaterial( { wireframe: true, color: 0x000000 } );

export default class OnLoadCallbacks {

  static onJSONLoad( e ) {

    let geometry, object;
    const JsonObj = JSON.parse( e.target.result );

    if ( !JsonObj.metadata ) {

      console.error( 'Unsupported JSON format' );
      return;

    }

    let type;

    if ( JsonObj.metadata.type ) type = JsonObj.metadata.type.toLowerCase();
    else type = 'object';

    switch ( type ) {

      case 'buffergeometry':
        geometry = loaders.bufferGeometryLoader.parse( JsonObj );
        object = new THREE.Mesh( geometry, defaultMat );
        break;
      case 'geometry':
        geometry = loaders.jsonLoader.parse( JsonObj );
        object = new THREE.Mesh( geometry, defaultMat );
        break;
      default:
        // scene object
        try {

          object = loaders.objectLoader.parse( JsonObj );

        } catch ( err ) {

          console.log( err );
          console.error( 'Error loading JSON file, check console log for details.' );

        }

    }

    if ( object ) loaderCanvas.addObjectToScene( object );

  }

  static onFBXLoad( e ) {

    loaders.fbxLoader.load( e.target.result, ( result ) => {

      console.log( result )
      loaderCanvas.addObjectToScene( result );

    } );

  }

  static onGLTFLoad( e ) {

    loaders.gltf2Loader.load( e.target.result, ( gltf ) => {

      if ( gltf.scenes.length > 1 ) {

        gltf.scenes.forEach( ( scene ) => {

          if ( gltf.animations ) scene.animations = gltf.animations;
          loaderCanvas.addObjectToScene( scene );

        } );

      } else if ( gltf.scene ) {

        if ( gltf.animations ) gltf.scene.animations = gltf.animations;
        loaderCanvas.addObjectToScene( gltf.scene );

      } else {

        console.error( 'No scene found in GLTF file.' );

      }

    } );

  }

  static onOBJLoad( e ) {

    loaders.objLoader2.load( e.target.result, ( result ) => {

      loaderCanvas.addObjectToScene( result );

    } );

  }

  static onDAELoad( e ) {

    loaders.colladaLoader.load( e.target.result, ( result ) => {

      const object = result.scene;

      if ( result.animations && result.animations.length > 0 ) object.animations = result.animations;

      loaderCanvas.addObjectToScene( object );

    } );

  }

  static onZipLoad( fbxFile, resources ) {

    const object = loaders.fbxLoader.parse( fbxFile, resources );
    loaderCanvas.addObjectToScene( object );

  }
}
