# Saamsa
Saamsa is an easy-to-use web & desktop application built to work with Kafka that:
* Displays consumer-level load on an individual broker
* Displays producer-level load on the topic level
* Allows you as the developer to see what consumer is consuming what data, which groups they belong to, and if any sticky or stale consumers need to be remedied.
* Allows you to see how your data is stored on topics and if your data rate is causing batching issues, leading to an imbalance of messages on individual partitions
* Allows you as the developer to circumvent the black box nature of Kafka and really get the behind-the-scenes of their implementation of the Kafka system and assess if everything is behaving as expected
* Allows you to visualize load balancing on Kafka brokers and to customize if necessary.

The second aspect of Saamsa dives further into Kafka than data visualization. It allows for single replication with exactly-once written commits and continuous real-time load balancing on a single topic on the same broker. This ensures data integrity and efficient read/write operations for maximal performance. All of this is done simply with a click of a button to make the developer experience with Kafka as smooth as possible! This functionality is achieved through a custom Kafka streams API implementation which gets attached to the provided topic. It replicates the data in real-time as an independent consumer and producer to the Kafka topic, ensuring no interference with native consumers and producers.

## Table of Contents
* Pre-requisites
* Features
* How it works
* Demo Testing App
* Installation
* Feature roadmap
* Contribute
* License

## Pre-requisites
To use this application, you'll need to have : 
1. A working instance of Kafka or an equivalent message broker
2. A Producer and consumer using Kafka as their message broker

## Features
Saamsa has the following features:
* An intuitive GUI.
* Insights into brokers, consumers, topics, offsets, partition indices
* Graphs to visualize & monitor load balancing on a topic level
* Button to customize load balancing on a topic level

## How it works
**Getting started with Saamsa is easy:** 
1. Download the app<ADD LINK> or visit the web application <ADD LINK>
2. Sign up if you are a new user. Otherwise, log in.
3. To add a new broker address, add the url in the input field and click *Submit*. 
4. To use an already submitted broker address, Click on the dropdown next to *Select broker* and choose the preferred broker.
5. *Select a topic* from the dropdown.
6. You can now see a graphical visualizer of your Saamsa topic on the selected broker.

**To customize load balancing:** 
1. Select the broker and the topic who's load balancing you want to customize.
2. Click on the "customize load balancing" button to customize load balancing for the selected topic.
3. Choose the topic with the name of the original topic name followed by "_balanced" (*example: "topicOne_balanced*).
4. You can now see load balancing customized on the selected topic.
  
## Demo Testing App
 
  We have created a demo testing app for you to understand how Saamsa works with an application that : 
  * Uses Kafka as its message broker
  * Creates Consumers that read data upon button click
  * Created producers that produce massive amounts of data upon button click
  
  To use our Demo app, all you have to do is : 
  1. Install Docker Desktop
  2. Go to Docker and use the following docker images[Saamsa Demo Application] (https://github.com/Saamsa/SaamsaTestingApp)
  3. Run "bash docker compose up -d"
  This opens up a local Kafka instance at localhost:29092, accessible via Saamsa. 
  The controls for this instance : Topic, consumer, and producer creation, are now available at localhost:3000.
  
## Installation
 To use our [Web Application](www.google.com) / [Desktop Application](wwww.google.com), please follow steps 1 - 6 of Getting started with Saamsa , which can be found above.
  
## Feature Roadmap
 The development team intends to continue improving saamsa and adding more features.
 [Head to our roadmap](https://github.com/oslabs-beta/saamsa/issues) to see our upcoming planned features. 
 
## Contributors
  [Adam Thibodeaux](https://github.com/adam-thibodeaux) - [LinkedIn](https://www.linkedin.com/in/adam-thibodeaux-b0812b210/)
  <br>
  [Shamilah Faria](https://github.com/shamilahfaria) - [LinkedIn](https://www.linkedin.com/in/shamilah-faria/)
  <br>
  [Janilya Baizack](https://github.com/janilya) - [LinkedIn](https://www.linkedin.com/in/janilya/)
  <br>
  [Kasthuri Menon](https://github.com/kasthurimenon) - [LinkedIn](www.linkedin.com/in/kasthurimenon)
  <br>
  
  If you'd like to support the active development of Saamsa:
  * Add a GitHub Star to the project
  * Tweet about the project on your Twitter
  * Write a review or tutorial on Medium, Dev.to or personal blog.
 <hr>
