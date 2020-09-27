interface Number {
  noExponents: () => string;
  toFlooredFixed: (d: number) => number;
}

Number.prototype.noExponents = function() {
  var data = String(this).split(/[eE]/);
  if (data.length == 1) return data[0];

  var z = "",
    sign = this < 0 ? "-" : "",
    str = data[0].replace(".", ""),
    mag = Number(data[1]) + 1;

  if (mag < 0) {
    z = sign + "0.";
    while (mag++) z += "0";
    return z + str.replace(/^\-/, "");
  }
  mag -= str.length;
  while (mag--) z += "0";
  return str + z;
};

Number.prototype.toFlooredFixed = function(d: number): number {
  return +(Math.floor(+this * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
};
