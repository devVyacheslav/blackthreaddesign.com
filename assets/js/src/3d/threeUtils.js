import * as THREE from 'three';

let fontLoader;

const createBufferAttribute = ( bufferGeometry, name, itemSize, count ) => {
  const buffer = new Float32Array( count * itemSize );
  const attribute = new THREE.BufferAttribute( buffer, itemSize );

  bufferGeometry.addAttribute( name, attribute );

  return attribute;
};

export default {
  /**
   * Duplicates vertices so each face becomes separate.
   * copied from  THREE.ExplodeModifier.

   */
  explodeModifier( geometry ) {
    const vertices = [];

    for ( let i = 0, il = geometry.faces.length; i < il; i++ ) {
      const n = vertices.length;
      const face = geometry.faces[i];

      const a = face.a;
      const b = face.b;
      const c = face.c;

      const va = geometry.vertices[a];
      const vb = geometry.vertices[b];
      const vc = geometry.vertices[c];

      vertices.push( va.clone() );
      vertices.push( vb.clone() );
      vertices.push( vc.clone() );

      face.a = n;
      face.b = n + 1;
      face.c = n + 2;
    }

    geometry.vertices = vertices;
  },

   /**
   * Break faces with edges longer than maxEdgeLength.
   * copied from  THREE.TessellateModifier.

   */
  tessellate( geometry, maxEdgeLength ) {
    let edge;

    const faces = [];
    const faceVertexUvs = [];
    const maxEdgeLengthSquared = maxEdgeLength * maxEdgeLength;

    for ( let i = 0, il = geometry.faceVertexUvs.length; i < il; i++ ) {

      faceVertexUvs[i] = [];

    }

    for ( let i = 0, il = geometry.faces.length; i < il; i++ ) {

      const face = geometry.faces[i];

      if ( face instanceof THREE.Face3 ) {

        const a = face.a;
        const b = face.b;
        const c = face.c;

        const va = geometry.vertices[a];
        const vb = geometry.vertices[b];
        const vc = geometry.vertices[c];

        const dab = va.distanceToSquared( vb );
        const dbc = vb.distanceToSquared( vc );
        const dac = va.distanceToSquared( vc );

        if ( dab > maxEdgeLengthSquared || dbc > maxEdgeLengthSquared || dac > maxEdgeLengthSquared ) {

          const m = geometry.vertices.length;

          const triA = face.clone();
          const triB = face.clone();

          let vm;
          let vnm;
          let vcm;

          if ( dab >= dbc && dab >= dac ) {

            vm = va.clone();
            vm.lerp( vb, 0.5 );

            triA.a = a;
            triA.b = m;
            triA.c = c;

            triB.a = m;
            triB.b = b;
            triB.c = c;

            if ( face.vertexNormals.length === 3 ) {

              vnm = face.vertexNormals[0].clone();
              vnm.lerp( face.vertexNormals[1], 0.5 );

              triA.vertexNormals[1].copy( vnm );
              triB.vertexNormals[0].copy( vnm );

            }

            if ( face.vertexColors.length === 3 ) {

              vcm = face.vertexColors[0].clone();
              vcm.lerp( face.vertexColors[1], 0.5 );

              triA.vertexColors[1].copy( vcm );
              triB.vertexColors[0].copy( vcm );

            }

            edge = 0;

          } else if ( dbc >= dab && dbc >= dac ) {

            vm = vb.clone();
            vm.lerp( vc, 0.5 );

            triA.a = a;
            triA.b = b;
            triA.c = m;

            triB.a = m;
            triB.b = c;
            triB.c = a;

            if ( face.vertexNormals.length === 3 ) {

              vnm = face.vertexNormals[1].clone();
              vnm.lerp( face.vertexNormals[2], 0.5 );

              triA.vertexNormals[2].copy( vnm );

              triB.vertexNormals[0].copy( vnm );
              triB.vertexNormals[1].copy( face.vertexNormals[2] );
              triB.vertexNormals[2].copy( face.vertexNormals[0] );

            }

            if ( face.vertexColors.length === 3 ) {

              vcm = face.vertexColors[1].clone();
              vcm.lerp( face.vertexColors[2], 0.5 );

              triA.vertexColors[2].copy( vcm );

              triB.vertexColors[0].copy( vcm );
              triB.vertexColors[1].copy( face.vertexColors[2] );
              triB.vertexColors[2].copy( face.vertexColors[0] );

            }

            edge = 1;

          } else {

            vm = va.clone();
            vm.lerp( vc, 0.5 );

            triA.a = a;
            triA.b = b;
            triA.c = m;

            triB.a = m;
            triB.b = b;
            triB.c = c;

            if ( face.vertexNormals.length === 3 ) {

              vnm = face.vertexNormals[0].clone();
              vnm.lerp( face.vertexNormals[2], 0.5 );

              triA.vertexNormals[2].copy( vnm );
              triB.vertexNormals[0].copy( vnm );

            }

            if ( face.vertexColors.length === 3 ) {

              vcm = face.vertexColors[0].clone();
              vcm.lerp( face.vertexColors[2], 0.5 );

              triA.vertexColors[2].copy( vcm );
              triB.vertexColors[0].copy( vcm );

            }

            edge = 2;

          }

          faces.push( triA, triB );
          geometry.vertices.push( vm );

          for ( let j = 0, jl = geometry.faceVertexUvs.length; j < jl; j++ ) {

            if ( geometry.faceVertexUvs[j].length ) {

              const uvs = geometry.faceVertexUvs[j][i];

              const uvA = uvs[0];
              const uvB = uvs[1];
              const uvC = uvs[2];

              // AB

              let uvsTriA;
              let uvsTriB;
              let uvM;

              if ( edge === 0 ) {

                uvM = uvA.clone();
                uvM.lerp( uvB, 0.5 );

                uvsTriA = [uvA.clone(), uvM.clone(), uvC.clone()];
                uvsTriB = [uvM.clone(), uvB.clone(), uvC.clone()];

                // BC

              } else if ( edge === 1 ) {

                uvM = uvB.clone();
                uvM.lerp( uvC, 0.5 );

                uvsTriA = [uvA.clone(), uvB.clone(), uvM.clone()];
                uvsTriB = [uvM.clone(), uvC.clone(), uvA.clone()];

                // AC

              } else {

                uvM = uvA.clone();
                uvM.lerp( uvC, 0.5 );

                uvsTriA = [uvA.clone(), uvB.clone(), uvM.clone()];
                uvsTriB = [uvM.clone(), uvB.clone(), uvC.clone()];

              }

              faceVertexUvs[j].push( uvsTriA, uvsTriB );

            }

          }

        } else {

          faces.push( face );

          for ( let j = 0, jl = geometry.faceVertexUvs.length; j < jl; j++ ) {

            faceVertexUvs[j].push( geometry.faceVertexUvs[j][i] );

          }

        }

      }

    }

    geometry.faces = faces;
    geometry.faceVertexUvs = faceVertexUvs;
  },

  // recursive version of tesselate
  tessellateRecursive( geometry, maxEdgeLength, depth ) {
    for ( let i = 0; i < depth; i++ ) {
      this.tessellate( geometry, maxEdgeLength );
    }
  },

  // compute the centroid of a triangular face
  computeCentroid: ( function () {
    const v = new THREE.Vector3();

    return function ( geometry, face ) {
      const a = geometry.vertices[face.a];
      const b = geometry.vertices[face.b];
      const c = geometry.vertices[face.c];

      v.x = ( a.x + b.x + c.x ) / 3;
      v.y = ( a.y + b.y + c.y ) / 3;
      v.z = ( a.z + b.z + c.z ) / 3;

      return v;
    };
  }() ),

  // promisified version of THREE.FontLoader
  fontLoader: ( url ) => {
    const promiseLoader = url => new Promise( ( resolve, reject ) => {
      if ( !fontLoader ) fontLoader = new THREE.FontLoader();
      fontLoader.load( url, resolve );
      // reject( console.error( 'Couldn\'t load font ' + url ) );
    } );

    return promiseLoader( url )
    .then( ( object ) => {
      return object;
    })
  },

  // Add an attribute to a bufferGeometry and return a reference to the attribute
  createBufferAttribute,

  // set the .index property of a bufferGeometry from faces
  setBufferGeometryIndicesFromFaces: ( bufferGeometry, faceCount, faces ) => {
    const indexBuffer = new Uint32Array( faceCount * 3 );

    bufferGeometry.setIndex( new THREE.BufferAttribute( indexBuffer, 1 ) );

    for ( let i = 0, offset = 0; i < faceCount; i++, offset += 3 ) {
      const face = faces[i];

      indexBuffer[offset] = face.a;
      indexBuffer[offset + 1] = face.b;
      indexBuffer[offset + 2] = face.c;
    }
  },

  // create an attribute 'positions' from a set of vertices
  bufferPositions: ( bufferGeometry, vertices ) => {
    const vertexCount = vertices.length;
    const positionBuffer = createBufferAttribute( bufferGeometry, 'position', 3, vertexCount ).array;

    for (let i = 0, offset = 0; i < vertexCount; i++, offset += 3) {
      const vertex = vertices[i];

      positionBuffer[offset    ] = vertex.x;
      positionBuffer[offset + 1] = vertex.y;
      positionBuffer[offset + 2] = vertex.z;
    }
  },

  positionTextGeometry: ( geometry, anchor ) => {
    geometry.computeBoundingBox();

    const size = geometry.boundingBox.getSize();
    const anchorX = size.x * -anchor.x;
    const anchorY = size.y * -anchor.y;
    const anchorZ = size.z * -anchor.z;
    const matrix = new THREE.Matrix4().makeTranslation( anchorX, anchorY, anchorZ );

    geometry.applyMatrix( matrix );

    return geometry;
  },

};