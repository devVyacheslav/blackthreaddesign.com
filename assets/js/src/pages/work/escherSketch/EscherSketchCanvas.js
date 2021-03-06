import * as THREE from 'three';

import App from 'App/App.js';

// import { createGeometries, createGeometry, positionsA, positionsB, uvsA, uvsB } from './escherSketchCanvasHelpers.js';
import { createGeometries } from './escherSketchCanvasHelpers.js';

import './escherSketchCanvasSetup.js';

import basicVert from './shaders/basic.vert';
import basicFrag from './shaders/basic.frag';

import RegularHyperbolicTesselation from './utilities/RegularHyperbolicTesselation.js';


export default class EscherSketchCanvas {

  constructor( showStats ) {

    const self = this;

    self.container = document.querySelector( '.canvas-container' );

    self.app = new App( document.querySelector( '#escherSketch-canvas' ) );

    self.app.camera.position.set( 0, 0, 1.5 );
    self.app.camera.far = 5;

    self.initPQControls();

    self.initSpec();

    self.initMaterials();

    this.buildTiling();

    self.app.onUpdate = function () {

    };

    self.app.onWindowResize = function () {

    };

    self.app.play();

  }

  initPQControls() {
    const self = this;

    const p = document.querySelector( '#p-value' );
    const q = document.querySelector( '#q-value' );

    const pValue = () => parseInt( p.innerHTML, 10 );

    const qValue = () => parseInt( q.innerHTML, 10 );

    const observer = new MutationObserver( ( ) => {

      const newP = pValue();
      const newQ = qValue();

      if ( this.spec.p === newP && this.spec.q === newQ ) return;

      this.spec.p = newP;
      this.spec.q = newQ;

      // TODO: display a warning here saying p, q can't both be 4
      if ( pValue() === 4 && qValue() === 4 ) return; 

      // Add a slight delay before rebuilding the tiling to allow the displayed
      // value p / q to update
      setTimeout( () => self.buildTiling(), 10 );

    } );

    observer.observe( p, { childList: true } );
    observer.observe( q, { childList: true } );

  }

  buildTiling() {
    this.clearTiling();

    console.time( 'Generate Tiling' );
    const tiling = new RegularHyperbolicTesselation( this.spec ).generateTiling( false );
    console.timeEnd( 'Generate Tiling' );

    console.time( 'Draw Tiling' );
    this.generateDisk( tiling );
    console.timeEnd( 'Draw Tiling' );

    console.log( 'Tiling length: ' + tiling.length );
  }

  clearTiling() {
    while ( this.app.scene.children.length > 0 ) {
      const object = this.app.scene.children[0];
      if ( object.type === 'Mesh' ) {
        object.geometry.dispose();
        this.app.scene.remove( object );
      }
    }
  }

  initSpec() {
    const imagesPath = '/assets/images/work/escher-sketch/tiles/';

    this.spec = {
      wireframe: false,
      p: 6,
      q: 6,
      radius: 100,
      textures: [`${imagesPath}fish-black.png`, `${imagesPath}fish-white.png`],
      edgeAdjacency: [ // array of length p
          [
            1, // edge_0 orientation (-1 = reflection, 1 = rotation)
            5, //edge_0 adjacency (range p - 1)
          ],
          [1, 4], // edge_1 orientation, adjacency
          [1, 3], [1, 2], [1, 1], [1, 0]
        ],
      minPolygonSize: 0.01,
    };
  }

  generateDisk( tiling ) {
    const geometries = createGeometries( tiling );

    const meshA = new THREE.Mesh( geometries[0], this.pattern.materials[tiling[0].materialIndex] );
    const meshB = new THREE.Mesh( geometries[1], this.pattern.materials[tiling[1].materialIndex] );

    this.app.scene.add( meshA );  // black fish
    this.app.scene.add( meshB ); // white fish
  }

  initMaterials( ) {
    this.pattern = new THREE.MultiMaterial();

    for ( let i = 0; i < this.spec.textures.length; i++ ) {

      const texture = new THREE.TextureLoader().load( this.spec.textures[i] );
      texture.anisotropy = this.app.renderer.getMaxAnisotropy();

      const material = new THREE.RawShaderMaterial( {
        uniforms: {
          tileTexture: {
            value: texture,
          },
        },
        vertexShader: basicVert,
        fragmentShader: basicFrag,
        side: THREE.DoubleSide,
      } );

      this.pattern.materials.push( material );
    }
  }

}
