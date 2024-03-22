// Disable auto discovery for all elements
Dropzone.autoDiscover = false;

// Function to initialize Dropzone
function init() {
  // Create a new Dropzone for the specified element with given options
  let dz = new Dropzone("#image-dropzone", {
    url: "/", // URL where the form will be submitted
    maxFiles: 1, // Maximum number of files
    addRemoveLinks: true, // Option to add remove links
    dictDefaultMessage: "Some Message", // Default message for Dropzone
    autoProcessQueue: false, // Don't auto process the queue to allow manual submission
  });

  // Event listener for when a new file is added
  dz.on("addedfile", function () {
    // If a second file is added, remove the first one to enforce single file upload
    if (dz.files[1] != null) {
      dz.removeFile(dz.files[0]);
    }
  });

  // Event listener for when a file upload is complete
  dz.on("complete", function (file) {
    // Extract the image data from the file
    let imageData = file.dataURL;

    // Server URL to which the image data should be submitted
    var url = "http://127.0.0.1:5000/classify_image";

    // Use jQuery's POST method to send the image data to the server
    $.post(
      url,
      {
        image_data: file.dataURL,
      },
      function (data, status) {
        // Log the received data for debugging
        console.log(data);

        // If no data is received, or data length is zero, show the error modal
        if (!data || data.length == 0) {
          $("#resultHolder").hide();
          $("#divClassTable").hide();
          $("#errorModal").modal('show');
          return;
        }

        // List of leaders to be displayed
        let leaders = [
          "elon_musk",
          "ginni_rometty",
          "satya_nadella",
          "sheryl_sandberg",
          "sundar_pichai",
        ];

        // Variables to keep track of the best match
        let match = null;
        let bestScore = -1;

        // Loop through the data to find the best match
        for (let i = 0; i < data.length; ++i) {
          let maxScoreForThisClass = Math.max(...data[i].class_probability);
          if (maxScoreForThisClass > bestScore) {
            match = data[i];
            bestScore = maxScoreForThisClass;
          }
        }

        // If a match is found, display the results
        if (match) {
          $("#error").hide();
          $("#resultHolder").show();
          $("#divClassTable").show();

          // Clear previous results
          $("#resultsBody").empty();

          // Dynamically add rows for each leader with their scores
          leaders.forEach(player => {
            let score = match.class_probability[match.class_dictionary[player]];
            let row = `<tr><td>${player.replace('_', ' ')}</td><td>${score.toFixed(2)}</td></tr>`;
            $("#resultsBody").append(row);
          });
        }
        dz.removeFile(file);
      }
    );
  });

  // Event listener for the classify button click
  $("#classifyBtn").on("click", function (e) {
    // Process the queue when the button is clicked
    dz.processQueue();
  });
}

// Wait for the document to be ready before initializing
$(document).ready(function () {
  console.log("ready!");
  // Initially hide the error message, result holder, and class table
  $("#error").hide();
  $("#resultHolder").hide();
  $("#divClassTable").hide();

  // Initialize Dropzone
  init();
});
