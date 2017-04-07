import * as THREE from 'three';

import App from '../../../App/App.js';

import { createGeometry, bufferGeometryA, bufferGeometryB, positionsA, positionsB, uvsA, uvsB } from './escherSketchCanvasHelpers.js';
import './escherSketchCanvasSetup.js';

import basicVert from './shaders/basic.vert';
import basicFrag from './shaders/basic.frag';

import StatisticsOverlay from '../../../App/StatisticsOverlay.js';

import RegularHyperbolicTesselation from './utilities/RegularHyperbolicTesselation.js';


export default class EscherSketchCanvas {

  constructor( showStats ) {

    const self = this;

    self.container = document.querySelector( '.canvas-container' );

    self.app = new App( document.querySelector( '#escherSketch-canvas' ) );

    self.app.camera.position.set( 0, 0, 1.5 );
    self.app.camera.far = 5;

    // TODO: not working in Edge
    let statisticsOverlay;
    if ( showStats ) statisticsOverlay = new StatisticsOverlay( self.app, self.container );

    self.initPQControls();

    self.initSpec();

    self.initMaterials();

    this.buildTiling();

    self.app.onUpdate = function () {

      if ( showStats ) statisticsOverlay.updateStatistics( self.app.delta );

    };

    self.app.onWindowResize = function () {

    };

    self.app.play();

    console.log(self.app.renderer.info)

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
    const imagesPath = '/assets/images/work/escherSketch/tiles/';

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
      minPolygonSize: 0.04,
    };
  }

  generateDisk( tiling ) {
    for ( let i = 0; i < tiling.length; i++ ) {
      createGeometry( tiling[i] );
    }

    const bufferGeometryA = new THREE.BufferGeometry();
    const bufferGeometryB = new THREE.BufferGeometry();

    bufferGeometryA.addAttribute( 'position', new THREE.Float32BufferAttribute( positionsA, 3 ) );
    bufferGeometryA.addAttribute( 'uv', new THREE.Float32BufferAttribute( uvsA, 2 ) );

    bufferGeometryB.addAttribute( 'position', new THREE.Float32BufferAttribute( positionsB, 3 ) );
    bufferGeometryB.addAttribute( 'uv', new THREE.Float32BufferAttribute( uvsB, 2 ) );

    const meshA = new THREE.Mesh( bufferGeometryA, this.pattern.materials[tiling[0].materialIndex] );
    const meshB = new THREE.Mesh( bufferGeometryA, this.pattern.materials[tiling[1].materialIndex] );

    this.app.scene.add( meshA );
    this.app.scene.add( meshB );
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
