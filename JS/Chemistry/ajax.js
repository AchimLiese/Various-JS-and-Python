function byId(id){
  return document.getElementById(id);
}

function valueByName(name){
  var els = document.getElementsByName(name), i;
  for(i = 0;i<els.length;i++){
    if (els[i].checked){
      return els[i].value;
    }
  }
  return undefined;
}

function init(){
  var inputObj = byId("input"),
    outputObj = byId("output"),
    growSizeObj = byId("growSize"),
    button = byId("calculate"),
    isDebugObj = byId("isDebugOn");

  function parseInput(rawText){
    var rows = rawText.split(/\n/).map(function(line){
      return line.split(/,\s*/).map(parseFloat);
    }),
        toRad = function(deg){ return deg * Math.PI / 180;},
        firstTwoRows = rows.shift().concat(rows.shift().map(toRad)),
        cellParams = vectorConstructor("a","b","c", "alpha","beta","gama")(firstTwoRows),
        tolerance = rows.shift(),
        ions = rows.map(vectorConstructor("x","y","z","value")),
        positionType = valueByName("positionType");

    if(positionType == 'relative'){
      ions = ions.map(function(ion){
        ion.x *= cellParams.a;
        ion.y *= cellParams.b;
        ion.z *= cellParams.c;
        return ion;
      });
    }
    
    return {
      ions: ions,
      refIndex: 0,
      cellParams: cellParams,
      tolerance:tolerance
    };
  }

  button.addEventListener("click", function(){
    var rawInput = inputObj.value,
        input = parseInput(rawInput),
        growSize = parseInt(growSizeObj.value, 10),
        isDebug = isDebugObj.checked, results,
        positionType = valueByName("positionType");
    
    EUGEN.config =  {
      ions: input.ions,
      refIonIndex: input.refIndex,
      cellParams: input.cellParams,
      expRange: growSize,
      isDebug: isDebug,
      positionType: positionType
    };
    results = EUGEN.makeCalculation();

    outputObj.innerHTML = isDebug ? debugOutput(results) : normalOutput(results);
  });

  function normalOutput(results) {
    var resultTable = ["<table border='1'><thead><tr><th>Iter.</th><th>Weighted Energy</th><th>Madelung</th></thead>",
      "<tbody><tr>"];

    resultTable = resultTable.concat(results.map(
      function(row, i) {
        return "<td>" + (i + 1) + "</td><td>" + row.join("</td><td>") + "</td>";
      }).join("</tr><tr>"));

    resultTable = resultTable.concat(["</tr></tbody></table>"]);

    return resultTable.join("");
  }

  function debugOutput(results) {
    return results.map(
      function(row) {
        var header = ["<div class='debug'><span>Show Debug</span><br/><table border='1'>",
          "<thead><tr><th colspan='3'>Absolute</th><th colspan='3'>Shift Vector</th>",
          "<th rowspan='2'>Ind</th><th rowspan='2'>V</th><th rowspan='2'>r</th><th rowspan='2'>V/r</th></tr><tr>",
          "<th>X</th><th>Y</th><th>Z</th>",
          "<th>X</th><th>Y</th><th>Z</th>",
          "</tr></thead>",
          "<tbody><tr>"],
          sum = 0;


        var body = row[3].map(
          function(row) {
            sum += row.slice(-1)[0];
            return ["<td>", row.join("</td><td>"), "</td>"].join("");
          }).join("</tr><tr>");

        var tail = ["</tr><tr><td colspan='9' align='right'>Sum:<br/>Cumulative:</td>",
          "<td>", sum, "<br/>",row.pop(),"</td>",
          "</tr></tbody></table>",
          "</div>"].join("");

        row[3] = header.concat(body).concat(tail).join("");
        return row.join("\t");
      }).join("<br/>");
  }

  $(".debug span").live('click', function(){
    $(this).parents(".debug").find("table").toggle();
  });
}

document.addEventListener("DOMContentLoaded", init);
