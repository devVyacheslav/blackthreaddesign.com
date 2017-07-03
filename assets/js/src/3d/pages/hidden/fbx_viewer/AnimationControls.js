import throttle from 'lodash.throttle';

export default class AnimationControls {

  constructor( animation, action, mixer ) {

    this.animation = animation;
    this.action = action;
    this.mixer = mixer;

    this.slider = document.querySelector( '#animation-slider' );
    this.playButton = document.querySelector( '#play-button' );
    this.pauseButton = document.querySelector( '#pause-button' );
    this.playbackControl = document.querySelector( '#playback-control' );

    document.querySelector( '#animation-controls' ).classList.remove( 'hide' );

    // set animation slider max to length of animation
    this.slider.max = String( animation.duration );

    // update the slider at ~ 60fps
    this.slider.step = String( animation.duration / 150 );

    this.initPlaybackControls();

    this.initSlider();


  }

  setSliderValue( val ) {

    this.slider.value = String( val );

  }

  initPlaybackControls() {

    const self = this;

    this.playbackControl.addEventListener( 'click', () => {

      self.togglePause();

    } );

  }

  togglePause() {

    if ( !this.action.paused ) {

      this.pause();

    } else {

      this.play();

    }

  }

  pause() {

    this.action.paused = true;
    this.playButton.classList.remove( 'hide' );
    this.pauseButton.classList.add( 'hide' );

  }

  play() {

    this.playButton.classList.add( 'hide' );
    this.pauseButton.classList.remove( 'hide' );

    this.action.reset();

    this.action.startAt( this.slider.value ).play();

    // const startTime = this.slider.value;
    // this.action.time = this.slider.value;
    // this.action.play();
    // this.action.paused = false;
  }

  initSlider() {

    this.slider.addEventListener( 'mousedown', () => {

      this.pause();

    } );

    this.slider.addEventListener( 'input', throttle( () => {


      const newPos = this.slider.value;

      this.action.time = newPos;

      this.slider.value = String( newPos );

    }, 17 ) ); // throttling at ~17 ms will give approx 60fps while sliding the controls

    this.slider.addEventListener( 'mouseup', () => {

      // console.log( this.action.time, this.slider.value );

      this.play();

      // console.log( this.action.time, this.slider.value );

    } );

  }
}

