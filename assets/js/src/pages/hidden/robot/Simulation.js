import * as THREE from 'three';

import canvas from './Canvas.js';

import Loaders from './utilities/Loaders.js';
import HTMLControl from './utilities/HTMLControl.js';
import invertMirroredFBX from './utilities/invertMirroredFBX.js';
import animationControls from './utilities/AnimationControls.js';
import Grid from './utilities/Grid.js';

const loaders = new Loaders();

const timing = {

  ballMoveStart: 13,

};

export default class Simulation {

  constructor() {

    this.preLoad();

    // this.loadModels();

    this.postLoad();

  }

  // everything done before loading is called here
  preLoad() {

    const self = this;

    this.loadingPromises = [];

    this.initGrid();

    // Put any per frame calculation here
    canvas.app.onUpdate = function () {
      // NB: use self inside this function, 'this' will refer to App

      animationControls.update( this.delta );
      self.grid.render( canvas.app.renderer );

    };

    // put any per resize calculations here (throttled to once per 250ms)
    canvas.app.onWindowResize = function () {

      // NB: use self inside this function
      self.grid.resize();

    };

    this.initReset();

  }

  // load the models
  loadModels() {

    const fieldPromise = loaders.fbxLoader( '/assets/models/robot/field.fbx' ).then( ( object ) => {

      // object.getObjectByName( 'Field' ).receiveShadow = true;

      // field width width ~140cm, length ~200cm
      canvas.app.scene.add( object );

    } );

    const naoPromise = loaders.fbxLoader( '/assets/models/robot/nao.fbx' ).then( ( object ) => {

      // NOTE: Will no longer be needed if https://github.com/mrdoob/three.js/issues/11911 is merged
      invertMirroredFBX( object );

      this.nao = object;

    } );

    const ballPromise = loaders.fbxLoader( '/assets/models/robot/ball.fbx' ).then( ( object ) => {

      this.ball = new THREE.Group();

      this.ballMesh = object;
      this.ball.add( this.ballMesh );

    } );

    this.loadingPromises = [ fieldPromise, naoPromise, ballPromise ];

  }

  // everything done after loading is called here
  postLoad() {

    Promise.all( this.loadingPromises ).then(
      () => {

        this.init();

        // this.addObjects();
        // this.initSimulation();
        HTMLControl.setOnLoadEndState();

        canvas.app.play();

      },
    );

  }

  init() {

    HTMLControl.controls.simulate.disabled = false;

    animationControls.reset();
    canvas.app.controls.reset();

    this.initPositions();
    this.updateEquation();
    HTMLControl.setInitialState();
    // this.setInitialTransforms();

  }

  initGrid() {

    this.grid = new Grid();

    // canvas.app.scene.add( this.grid.scene.children[0] );
    // canvas.app.scene.add( this.grid.scene.children[1] );
    // canvas.app.scene.add( this.grid.scene.children[2] );
    // canvas.app.scene.add( this.grid.scene.children[3] );
    // canvas.app.scene.add( this.grid.scene.children[4] );
    // canvas.app.scene.add( this.grid.scene.children[5] );

    HTMLControl.controls.slope.addEventListener( 'change', ( e ) => {

      e.preventDefault();

    }, false );

  }

  // set up positions for the animations
  initPositions() {
    this.ballInitialPos = [
      THREE.Math.randInt( -15, 30 ),
      4.75,
      THREE.Math.randInt( -15, 30 ),
    ];

    this.naoInitialPos = [ this.ballInitialPos[0] - 44, 0, this.ballInitialPos[2] - 37 ];

  }

  updateEquation() {

    HTMLControl.ballPosition.innerHTML = this.ballInitialPos[0] + ', ' + this.ballInitialPos[2];

    const signA = this.ballInitialPos[0] > 0 ? ' - ' : '';
    const signB = this.ballInitialPos[2] > 0 ? ' ) + ' : ' ) ';

    HTMLControl.equation.innerHTML =
      '( '
      + 'x '
      + signA
      + this.ballInitialPos[0]
      + signB
      + this.ballInitialPos[2];
  }

  initReset() {

    HTMLControl.controls.reset.addEventListener( 'click', () => {

      cancelAnimationFrame( this.ballAnimationFrameId );
      this.ballAnimationFrameId = undefined;

      clearTimeout( this.ballTimer );
      this.ballTimer = undefined;

      this.init();

    } );

  }

  addObjects() {

    canvas.app.scene.add( this.nao, this.ball );

  }

  setInitialTransforms() {

    this.ball.position.set( this.ballInitialPos[0], this.ballInitialPos[1], this.ballInitialPos[2] );

    this.nao.position.set( this.naoInitialPos[0], this.naoInitialPos[1], this.naoInitialPos[2] );

    this.nao.rotation.set( 0, 0, 0 );
    this.ball.rotation.set( 0, 0, 0 );
    this.ballMesh.rotation.set( 0, 0, 0 );

  }

    // this is set up after the user has entered the slope
  initNaoAnimation() {

    this.naoMixer = new THREE.AnimationMixer( this.nao );
    this.naoMixer.name = 'nao mixer';

    animationControls.initAnimation( this.nao, this.nao.animations[ 0 ], this.naoMixer, timing.naoAnimStart );

  }

  // this is set up after the user has entered the slope
  initBallAnimation( slope ) {

    const self = this;

    // ball initial velocity ( not physically calculated, just start at 1 )
    const initialVelocity = 1;

    // split this into x and z components based on slope
    const angle = Math.atan( slope );
    let xVel = Math.cos( angle ) * initialVelocity;
    let zVel = Math.sin( angle ) * initialVelocity;

    // this.ball.rotateY( -angle );

    // set up rotation axis
    const axis = new THREE.Vector3( 0, 0, 1 );

    axis.set( xVel, 0, zVel ).normalize();
    axis.cross( THREE.Object3D.DefaultUp );

    function moveBall() {

      // checks to reverse x direction
      const postXPositionCheck = ( self.ball.position.x >= 73 );
      const nearPostZPositionCheck = postXPositionCheck && ( self.ball.position.z >= 20 && self.ball.position.z <= 30 );
      const farPostZPositionCheck = postXPositionCheck && ( self.ball.position.z <= -20 && self.ball.position.z >= -30 );
      const postCheck = nearPostZPositionCheck || farPostZPositionCheck;

      const nearFrontAdBoardCheck = ( self.ball.position.x >= 87 && self.ball.position.z <= -20 );
      const farFrontAdBoardCheck = ( self.ball.position.x >= 87 && self.ball.position.z >= 20 );
      const frontAdBoardCheck = farFrontAdBoardCheck || nearFrontAdBoardCheck;

      const backOfGoalCheck = self.ball.position.x >= 92;

      // checks to reverse z direction
      const topAndBottomWallCheck = self.ball.position.z >= 55 || self.ball.position.z <= -55;

      if ( postCheck || frontAdBoardCheck ) {

        // don't reverse the direction more than once as this can cause 'juddering'
        // as the direction is rapidly changed
        xVel *= -1 * Math.sign( xVel );

        axis.set( xVel, 0, zVel ).normalize();
        axis.cross( THREE.Object3D.DefaultUp );

      }

      if ( backOfGoalCheck ) {

        xVel *= -0.5 * Math.sign( xVel );
        zVel *= 0.5;

        axis.set( xVel, 0, zVel ).normalize();
        axis.cross( THREE.Object3D.DefaultUp );

      }

      if ( topAndBottomWallCheck ) {

        zVel *= -1;

        axis.set( xVel, 0, zVel ).normalize();
        axis.cross( THREE.Object3D.DefaultUp );

        // self.ball.rotateY( Math.PI - ( 2 * angle ) );
        // self.ballMesh.rotateY( -( Math.PI - ( 2 * angle ) ) );

      }

      self.ball.translateX( xVel );
      self.ball.translateZ( zVel );

      // self.ball.translateX( totalVelocity );
      // totalVelocity *= 0.99166;

      xVel *= 0.99166; // value calculated to allow ball to roll approx 2 seconds
      zVel *= 0.99166;

      const totalVelocity = Math.sqrt( xVel * xVel + zVel * zVel );

      const amount = -totalVelocity / ( Math.PI * 10 ) * Math.PI;
      self.ballMesh.rotateOnAxis( axis, amount );

      if ( totalVelocity < 0.05 ) return;

      self.ballAnimationFrameId = requestAnimationFrame( () => { moveBall(); } );

    }

    this.ballTimer = setTimeout( () => {

      moveBall();

    }, timing.ballMoveStart * 1000 );

    // moveBall(); // roll ball immediately for testing

  }

  initSimulation() {

    HTMLControl.setInitialState();

    HTMLControl.controls.simulate.addEventListener( 'click', ( e ) => {

      e.preventDefault();

      const slope = -HTMLControl.controls.slope.value;

      this.initNaoAnimation();
      this.initBallAnimation( slope );

      animationControls.play();

      HTMLControl.controls.simulate.disabled = true;
      HTMLControl.controls.reset.disabled = false;

    }, false );

  }

}
