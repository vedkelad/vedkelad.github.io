var Vertex = function(x, y) {
  this.x = x;
  this.y = y;
};

var Weapon =
    function(canvas, name, clipSize, verticalRecoilAmount,
        horizontalRecoilMin, horizontalRecoilMax, tolerance,
        angleMin, angleMax, fSM, coneOfFire, bloom) {
  this.context = canvas.getContext('2d');
  this.name = name;
  this.clipSize = clipSize;
  this.verticalRecoilAmount = verticalRecoilAmount;
  this.horizontalRecoilMin = horizontalRecoilMin;
  this.horizontalRecoilMax = horizontalRecoilMax;
  this.tolerance = tolerance;
  this.angleMin = angleMin;
  this.angleMax = angleMax;
  this.fSM = fSM;
  this.coneOfFire = coneOfFire;
  this.bloom = bloom;
};

Weapon.START = new Vertex(400, 760);
Weapon.DIRECTION = new Vertex(1, -1);
Weapon.SCALE = 70;

Weapon.STYLES = {
  bullet: 'black',
  cone: 'black',
  cofCenter: 'blue',
  veritcalRecoil: 'green',
  horizontalRecoil: 'blue',
  actualRecoil: 'red'
};

Weapon.prototype.show = function(distance, numBullets) {
  var cones = [this.coneOfFire];
  var coneOfFireCenters = [new Vertex(0, 0)];
  var startPositions = [new Vertex(0, 0)];
  var shots = [];
  var bulletsToRender = (!numBullets || numBullets <= 0) ?
      this.clipSize : numBullets;
  for (var i = 0; i < bulletsToRender; i++) {

    // Compute new cone of fire.
    var radius = distance * MoreMath.tand(cones[i]);
    this.plotCircle_(startPositions[i], radius, Weapon.STYLES.cone);

    // Compute actual shot in cone of fire.
    var theta = MoreMath.random(2 * Math.PI);
    var r = Math.sqrt(Math.random()) * radius;
    shots.push(new Vertex(
        startPositions[i].x + r * Math.cos(theta),
        startPositions[i].y + r * Math.sin(theta)));

    window.console.log("Shot: ", shots[i].x, shots[i].y);
    this.plotPoint_(shots[i], Weapon.STYLES.bullet);

    // Calculate Recoil Angle.
    var recoilAngle = MoreMath.random(this.angleMin, this.angleMax); 

    // Calculating veritcal recoil amount and FSM (First Shot Multiplier).
    var verticalRecoilPos;
    if (i == 0) {
      verticalRecoilPos = new Vertex(
          MoreMath.sind(recoilAngle) * this.verticalRecoilAmount * this.fSM +
              shots[i].x,
          MoreMath.cosd(recoilAngle) * this.verticalRecoilAmount * this.fSM +
              shots[i].y);
    } else {
      verticalRecoilPos = new Vertex(
          MoreMath.sind(recoilAngle) * this.verticalRecoilAmount + shots[i].x,
          MoreMath.cosd(recoilAngle) * this.verticalRecoilAmount + shots[i].y);
    }

    this.plotLine_(shots[i], verticalRecoilPos, Weapon.STYLES.veritcalRecoil);

    // Calculate horizontal recoil.
    var horizontalRecoilPos =
        this.calculateHorizontalRecoil_(recoilAngle, verticalRecoilPos);
    
    // Plotting actual shots.
    this.plotPoint_(horizontalRecoilPos, Weapon.STYLES.bullet);
    this.plotLine_(verticalRecoilPos, horizontalRecoilPos,
        Weapon.STYLES.horizontalRecoil);  
    this.plotLine_(startPositions[i], horizontalRecoilPos,
        Weapon.STYLES.actualRecoil);

    // Reset firing position and add bloom.
    startPositions.push(horizontalRecoilPos);
    cones.push(cones[i] + this.bloom);
  }

  window.console.log(coneOfFireCenters, shots);
};

Weapon.prototype.calculateHorizontalRecoil_ =
    function(recoilAngle, verticalRecoilPos) {
  var recoilDirection = Math.random() > 0.5 ? 1 : -1; // -1: left, 1: right.

  var recoilAmount =
      MoreMath.random(this.horizontalRecoilMin, this.horizontalRecoilMax);

  // Make sure that the recoil goes in the right direction.
  var finalPosition = new Vertex(
        verticalRecoilPos.x +
            recoilDirection * MoreMath.cosd(recoilAngle) * recoilAmount,
        verticalRecoilPos.y -
            recoilDirection * MoreMath.sind(recoilAngle) * recoilAmount);

  // Changes direction of recoil if larger than tolerance.
  var averageAngle = (this.angleMax + this.angleMin) / 2
  var xMax = finalPosition.y / MoreMath.tand(90 - averageAngle) +
      this.tolerance;
  var xMin = xMax - 2 * this.tolerance; 

  return (finalPosition.x <= xMax) ? finalPosition :
      new Vertex(
        verticalRecoilPos.x - MoreMath.cosd(recoilAngle) * recoilAmount,
        verticalRecoilPos.y + MoreMath.sind(recoilAngle) * recoilAmount)
};

Weapon.prototype.plotCircle_ = function(center, radius, style) {
  var context = this.context;
  context.lineWidth = 1;
  context.strokeStyle = '#AA99BB';

  context.beginPath();
  context.arc(
    this.xPos_(center.x), this.yPos_(center.y),
    radius * Weapon.SCALE,
    0, 2 * Math.PI, false);
  context.stroke();
};

Weapon.prototype.plotPoint_ = function(position, style) {
  var context = this.context;
  context.strokeStyle = style;
  context.lineWidth = 1;

  // Horizontal line.
  context.beginPath();
  context.moveTo(this.xPos_(position.x) - 3, this.yPos_(position.y));
  context.lineTo(this.xPos_(position.x) + 3, this.yPos_(position.y));
  context.stroke();

  // Vertical line.
  context.beginPath();
  context.moveTo(this.xPos_(position.x), this.yPos_(position.y) - 3);
  context.lineTo(this.xPos_(position.x), this.yPos_(position.y) + 3);
  context.stroke();
};

Weapon.prototype.plotLine_ = function(pointA, pointB, style) {
  var context = this.context;
  context.strokeStyle = style;
  context.lineWidth = 1;

  // Horizontal line.
  context.beginPath();
  context.moveTo(this.xPos_(pointA.x), this.yPos_(pointA.y));
  context.lineTo(this.xPos_(pointB.x), this.yPos_(pointB.y));
  context.stroke();
};

////////////////////////////////////////////////////////////////////////////////

/**
 * Translate the x coordinate based on the geometry of the canvas.
 */
Weapon.prototype.xPos_ = function(x) {
  return Weapon.START.x + Weapon.DIRECTION.x * this.scale_(x);
};

/**
 * Translate the y coordinate based on the geometry of the canvas.
 */
Weapon.prototype.yPos_ = function(y) {
  return Weapon.START.y + Weapon.DIRECTION.y * this.scale_(y);
};

Weapon.prototype.scale_ = function(d) {
  return Weapon.SCALE * d;
}