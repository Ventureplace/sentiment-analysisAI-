// Load the Transformers pipeline for sentiment analysis
const pipeline = require("@huggingface/sentiment-analysis");

// Define the configuration for the sentiment analysis pipeline
const config = {
    model: "nlptown/bert-base-multilingual-uncased-sentiment",
    device: 0
};

// Get the current URL of the webpage
const currentUrl = window.location.href;

// Use the fetch API to get the contents of the webpage
fetch(currentUrl)
    .then(response => response.text())
    .then(html => {

        // Use a regular expression to extract the text content of the webpage
        const textContent = html.replace(/<[^>]*>/g, "");

        // Create a new sentiment analysis pipeline using the configuration
        const sentimentAnalysis = pipeline(config);

        // Call the pipeline on the text content of the webpage
        sentimentAnalysis(textContent).then(result => {

            // Determine if the sentiment is positive or negative
            const sentiment = result[0].label;
            let isBullish = false;
            if (sentiment === "POSITIVE") {
                isBullish = true;
            }

            // Get the confidence score of the sentiment analysis
            const confidence = result[0].score;

            // Output the sentiment analysis result to the console
            console.log("Sentiment:", sentiment);
            console.log("Confidence:", confidence);

            // Create an explanation for the sentiment analysis result
            let explanation = "";
            if (isBullish) {
                explanation = "The sentiment analysis indicates that this article is bullish. This means that the article has a positive outlook on the stock or investment in question, and suggests that it may be a good time to buy or hold the stock.";
            } else {
                explanation = "The sentiment analysis indicates that this article is bearish. This means that the article has a negative outlook on the stock or investment in question, and suggests that it may be a good time to sell or avoid the stock.";
            }

            // TODO: Display the sentiment analysis result and explanation in the UI
        });
    })
    .catch(error => {
        console.error(error);
    });


    function analyzePage() {
        // Get the current tab's URL and send it to the local Python server for analysis
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          var tabURL = tabs[0].url;
          var xhr = new XMLHttpRequest();
          xhr.open("POST", "http://localhost:5000/analyze", true);
          xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
              // Parse the sentiment analysis results and update the UI
              try {
                var response = JSON.parse(xhr.responseText);
                var sentiment = response.sentiment;
                var explanation = response.explanation;
                updateUI(sentiment, explanation);
              } catch (error) {
                console.log("Error parsing response: " + error.message);
                updateUI("error", "Error parsing response");
              }
            } else if (xhr.readyState === 4 && xhr.status !== 200) {
              console.log("Error making API request: " + xhr.statusText);
              updateUI("error", "Error making API request");
            }
          };
          xhr.onerror = function () {
            console.log("Error making API request");
            updateUI("error", "Error making API request");
          };
          xhr.send(JSON.stringify({ url: tabURL }));
        });
      }
      