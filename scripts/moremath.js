MoreMath = {
  tand: function(angleInDegrees) {
    return Math.tan(angleInDegrees * Math.PI / 180);
  },
  sind: function(angleInDegrees) {
    return Math.sin(angleInDegrees * Math.PI / 180);
  },
  cosd: function(angleInDegrees) {
    return Math.cos(angleInDegrees * Math.PI / 180);
  },
  random: function(minOrMax, max) {
    return (max === null || typeof max == "undefined") ?
        Math.random() * minOrMax : 
        Math.random() * (max - minOrMax) + minOrMax;
  }
};