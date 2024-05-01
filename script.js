await WebMidi.enable();

// Initialize variables to store the first MIDI input and output devices detected.
let myInput = WebMidi.inputs[0];
let myOutput = WebMidi.outputs[0];
let noteRepeat;
let beatLength = 125; //ms
let noteLength = 1.0; //100%
let randoThing = false;
// Get the dropdown elements from the HTML document by their IDs.
// These dropdowns will be used to display the MIDI input and output devices available.
let dropIns = document.getElementById("dropdown-ins");
let dropOuts = document.getElementById("dropdown-outs");

let myNotes = [];

// For each MIDI input device detected, add an option to the input devices dropdown.
// This loop iterates over all detected input devices, adding them to the dropdown.
WebMidi.inputs.forEach(function (input, num) {
  dropIns.innerHTML += `<option value=${num}>${input.name}</option>`;
});

// Similarly, for each MIDI output device detected, add an option to the output devices dropdown.
WebMidi.outputs.forEach(function (output, num) {
  dropOuts.innerHTML += `<option value=${num}>${output.name}</option>`;
});

// Add an event listener for the 'change' event on the input devices dropdown.
// This allows the script to react when the user selects a different MIDI input device.
dropIns.addEventListener("change", function () {
  // Before changing the input device, remove any existing event listeners
  // to prevent them from being called after the device has been changed.
  if (myInput.hasListener("noteon")) {
    myInput.removeListener("noteon");
  }

  // Change the input device based on the user's selection in the dropdown.
  myInput = WebMidi.inputs[dropIns.value];

  // After changing the input device, add new listeners for 'noteon' and 'noteoff' events.
  // These listeners will handle MIDI note on (key press) and note off (key release) messages.
  myInput.addListener("noteon", function (someMIDI) {
    // When a note on event is received, send a note on message to the output device.
    // This can trigger a sound or action on the MIDI output device.
    //myOutput.playNote(someMIDI.note, { duration: 2000 });
    // noteRepeat = setInterval(midiLoop, 500);
    if (myNotes.length == 0) {
      noteRepeat = setInterval(midiLoop, beatLength);
      console.log("loop started");
    }
    myNotes.push(someMIDI.note.number);
    // myOutput.channels[1].sendNoteOn(someMIDI.note, {
    //   duration: beatLength * noteLength,
    // });
    console.log(myNotes);
  });

  myInput.addListener("noteoff", function (someMIDI) {
    // myOutput.channels[1].sendNoteOff(someMIDI.note);
    myNotes.splice(myNotes.indexOf(someMIDI.note.number), 1);
    console.log(myNotes);
    if (myNotes.length == 0) {
      clearInterval(noteRepeat);
    }
  });
});
const midiLoop = function () {
  myNotes.forEach(function (someNote) {
    if (randoThing) {
      if (Math.random() > document.getElementById("prob").value) {
        myOutput.channels[2].playNote(someNote, {
          duration: beatLength * noteLength,
        });
      }
    } else {
      myOutput.channels[2].playNote(someNote, {
        duration: beatLength * noteLength,
      });
    }
  });
};
// Add an event listener for the 'change' event on the output devices dropdown.
// This allows the script to react when the user selects a different MIDI output device.
dropOuts.addEventListener("change", function () {
  // Change the output device based on the user's selection in the dropdown.
  // The '.channels[1]' specifies that the script should use the first channel of the selected output device.
  // MIDI channels are often used to separate messages for different instruments or sounds.
  myOutput = WebMidi.outputs[dropOuts.value];
});
document.getElementById("tempo").addEventListener("change", function () {
  let bpm = parseInt(this.value); //store sider value in "bpm"
  beatLength = 60 / bpm; //calculate the length of a beat in seconds
  beatLength *= 1000; //convert beat length to milliseconds
  clearInterval(noteRepeat);
  noteRepeat = setInterval(midiLoop, beatLength);
});
document.getElementById("note-length").addEventListener("input", function () {
  noteLength = this.value / 100;
});

document
  .getElementById("math coolness")
  .addEventListener("change", function () {
    randoThing = this.checked;
  });
