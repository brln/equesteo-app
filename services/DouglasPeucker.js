import { List } from 'immutable'
import { parseRideCoordinate} from "../helpers"

export function simplifyLine (tolerance, points) {
  // stolen from https://gist.github.com/adammiller/826148
  let res = List();

  if(points.count() > 0){
    class Line {
      constructor(p1, p2) {
        this.p1 = parseRideCoordinate(p1);
        this.p2 = parseRideCoordinate(p2);
      }

      distanceToPoint ( point ) {
        // slope
        point = parseRideCoordinate(point)
        let m = ( this.p2.get('latitude') - this.p1.get('latitude') ) / ( this.p2.get('longitude') - this.p1.get('longitude') ),
          // y offset
          b = this.p1.get('latitude') - ( m * this.p1.get('longitude') ),
          d = [];
        // distance to the linear equation
        d.push( Math.abs( point.get('latitude') - ( m * point.get('longitude') ) - b ) / Math.sqrt( Math.pow( m, 2 ) + 1 ) );
        // distance to p1
        d.push( Math.sqrt( Math.pow( ( point.get('longitude') - this.p1.get('longitude') ), 2 ) + Math.pow( ( point.get('latitude') - this.p1.get('latitude') ), 2 ) ) );
        // distance to p2
        d.push( Math.sqrt( Math.pow( ( point.get('longitude') - this.p2.get('longitude') ), 2 ) + Math.pow( ( point.get('latitude') - this.p2.get('latitude') ), 2 ) ) );
        // return the smallest distance
        return d.sort( function( a, b ) {
          return ( a - b ); //causes an array to be sorted numerically and ascending
        } )[0];
      }
    }

    let douglasPeucker = function( points, tolerance ) {
      if ( points.count() <= 2 ) {
        return List([points.get(0)]);
      }
      let returnPoints = List(),
        // make line from start to end
        line = new Line( points.get(0), points.get(points.count() - 1) ),
        // find the largest distance from intermediate points to this line
        maxDistance = 0,
        maxDistanceIndex = 0,
        p;
      for( let i = 1; i <= points.count() - 2; i++ ) {
        let distance = line.distanceToPoint( points.get(i) );
        if( distance > maxDistance ) {
          maxDistance = distance;
          maxDistanceIndex = i;
        }
      }
      // check if the max distance is greater than our tolerance allows
      if ( maxDistance >= tolerance ) {
        p = points.get(maxDistanceIndex);
        line.distanceToPoint( p, true );
        // include this point in the output
        returnPoints = returnPoints.concat(
          douglasPeucker(
            points.slice(
              0,
              maxDistanceIndex + 1
            ),
            tolerance
          )
        )
        returnPoints = returnPoints.concat(
          douglasPeucker(
            points.slice(
              maxDistanceIndex,
              points.count()
            ),
            tolerance
          )
        );
      } else {
        // ditching this point
        p = points.get(maxDistanceIndex);
        line.distanceToPoint( p, true );
        returnPoints = List([points.get(0)])
      }
      return returnPoints;
    };
    res = douglasPeucker( points, tolerance );
    // always have to push the very last point on so it doesn't get left off
    if (points.count() > 1) {
      res = res.push( points.get(points.count() - 1) );
    }
  }
  return res;
}