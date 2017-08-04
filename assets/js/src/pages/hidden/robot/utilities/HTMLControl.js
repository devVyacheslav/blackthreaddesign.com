// const loadOverlay =
const canvas = document.querySelector( '#viewer-canvas' );
const reset = document.querySelector( '#reset' );

const fullscreenButton = document.querySelector( '#fullscreen-button' );
const slope = document.querySelector( '#slope' );
const simulate = document.querySelector( '#simulate' );

const error = {
  overlay: document.querySelector( '#error-overlay' ),
  messages: document.querySelector( '#error-messages' ),
};

const animation = {
  slider: document.querySelector( '#animation-slider' ),
  playButton: document.querySelector( '#play-button' ),
  pauseButton: document.querySelector( '#pause-button' ),
  playbackControl: document.querySelector( '#playback-control' ),
  clipsSelection: document.querySelector( '#animation-clips' ),
  controls: document.querySelector( '#animation-controls' ),
};

const loading = {
  bar: document.querySelector( '#loading-bar' ),
  overlay: document.querySelector( '#loading-overlay' ),
  revealOnLoad: document.querySelectorAll( '.reveal-on-load' ),
  hideOnLoad: document.querySelectorAll( '.hide-on-load' ),
  progress: document.querySelector( '#progress' ),
};

const controls = {
  links: document.querySelector( '#controls' ).querySelectorAll( 'span' ),
  button: document.querySelector( '#toggle-background' ),
  sliders: document.querySelectorAll( '.loader-slider' ),
};


export default class HTMLControl {

  static setInitialState() {
    slope.value = 0;

    error.overlay.classList.add( 'hide' );
    error.messages.innerHTML = '';

  }

  static setOnLoadStartState() {
    loading.bar.classList.remove( 'hide' );
  }

  static setOnLoadEndState() {
    loading.overlay.classList.add( 'hide' );

    for ( let i = 0; i < loading.hideOnLoad.length; i++ ) {

      loading.hideOnLoad[ i ].classList.add( 'hide' );

    }

    for ( let i = 0; i < loading.revealOnLoad.length; i++ ) {

      loading.revealOnLoad[ i ].classList.remove( 'hide' );

    }
  }

  static setBlackBackgroundState() {
    for ( let i = 0; i < controls.links.length; i++ ) {

      controls.links[ i ].style.color = 'white';

    }

    for ( let i = 0; i < controls.sliders.length; i++ ) {

      controls.sliders[ i ].style.backgroundColor = 'white';

    }
  }

}

HTMLControl.canvas = canvas;
HTMLControl.reset = reset;
HTMLControl.fullscreenButton = fullscreenButton;
HTMLControl.error = error;
HTMLControl.animation = animation;
HTMLControl.loading = loading;
HTMLControl.controls = controls;
HTMLControl.slope = slope;
HTMLControl.simulate = simulate;

