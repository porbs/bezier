const { fromEvent } = rxjs;
const { tap, filter } = rxjs.operators;

/**
 * DOM ELEMENTS
 */

const dtIncreaseButton = document.getElementById("increase-button");
const dtDecreaseButton = document.getElementById("decrease-button");
const dtCounterLabel = document.getElementById("dt-counter");
const downloadButton = document.getElementById("download-button");
const metadataButton = document.getElementById("metadata-button");

/**
 * INIT
 */

updateDtLabel();

/**
 * HANDLERS
 */

const increaseTCounterButton$ = fromEvent(dtIncreaseButton, "click").pipe(
  filter(() => dt <= 0.45),
  tap(() => {
    dt += 0.05;
  }),
  tap(() => {
    updateDtLabel();
  })
);

const decreaseTCounterButton$ = fromEvent(dtDecreaseButton, "click").pipe(
  filter(() => dt >= 0.1),
  tap(() => {
    dt -= 0.05;
  }),
  tap(() => {
    updateDtLabel();
  })
);

const downloadButton$ = fromEvent(downloadButton, "click").pipe(
  tap(() => {
    const serialized = curves.map((curve) => curve.serialize());
    const filename = prompt("save as");
    downloadObjectAsJson(serialized, filename);
  })
);

const metadataButton$ = fromEvent(metadataButton, "click").pipe(
  tap(() => {
    metadata = !metadata;
  })
);

/**
 * SUBSCRIPTIONS
 */

increaseTCounterButton$.subscribe();
decreaseTCounterButton$.subscribe();
downloadButton$.subscribe();
metadataButton$.subscribe();

/**
 * FUNCTIONS
 */

function updateDtLabel() {
  dtCounterLabel.textContent = dt.toFixed(2);
}

function downloadObjectAsJson(exportObj, exportName) {
  var dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
