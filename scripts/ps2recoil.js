var canvas = document.getElementById("recoil-canvas");

var weapons = [
  new Weapon(canvas,
      'GD-7F', 30, 0.31, 0.225, 0.3, 0.625, -19, -17.5, 2, 0.1, 0.05)
];

var bullets = weapons[0].clipSize;
var burstSize = 10;
while (bullets > 10) {
  weapons[0].show(100, 10);
  bullets -= 4;
}
