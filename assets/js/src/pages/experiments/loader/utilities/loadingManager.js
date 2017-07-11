import * as THREE from 'three';

const manager = new THREE.LoadingManager();

// hide the upload form when loading starts so that the progress bar can be shown
manager.onStart = () => {

  document.querySelector( '#file-upload-form' ).classList.add( 'hide' );
  document.querySelector( '#loading-bar' ).classList.remove( 'hide' );

};

manager.onLoad = function ( ) {

  // this doesn't fire when loading objects with a single file

  // document.querySelector( '#loading-overlay' ).classList.add( 'hide' );

};

const progress = document.querySelector( '#progress' );
manager.onProgress = ( url, currentFile, totalFiles ) => {

  const percentComplete = currentFile / totalFiles * 100;
  progress.style.width = percentComplete + '%';

};
 
manager.onError = ( msg ) => {
  console.error( 'THREE.LoadingManager error: ' + msg );
};

export default manager;
