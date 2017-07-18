const UglifyJS = require( 'uglify-js' );
// const CleanCSS = require( 'clean-css' );

const fs = require( 'fs' );

const inputPath = 'assets/js/build/';

const outputPath = 'assets/js/build-min/';

const uglifyJSOptions = {

  compress: {

    dead_code: true,

  },
  ie8: false,

};

// Process js files
fs.readdir( inputPath, ( err, files ) => {

  files.forEach( ( file ) => {

    const inputFile = inputPath + file;
    const outputFile = outputPath + file;

    const inputCode = fs.readFileSync( inputFile, 'utf8' );

    // minify input code
    const outputCode = UglifyJS.minify( inputCode, uglifyJSOptions ).code;

    fs.writeFileSync( outputFile, outputCode, 'utf8' );

  } );

} );

// process css files