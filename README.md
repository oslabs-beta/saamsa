# Saamsa

Saamsa is an easy-to-use web & desktop application built to work with Kafka that:

- Displays consumer-level load on an individual broker
- Displays previous producer-level load on the topic level via topic-message-offsets
- Allows you as the developer to see what consumer is consuming what data, which groups they belong to, and if any sticky or stale consumers need to be remedied.
- Allows you to see how your data is stored on topics and if your data rate is causing batching issues, leading to an imbalance of messages on individual partitions
- Allows you as the developer to circumvent the black box nature of Kafka and really get the behind-the-scenes of your implementation of the Kafka system and assess if everything is behaving as expected
- Allows you to visualize load balancing on multiple Kafka brokers and to remedy any unbalanced loads on any topics.
- Allows for single replication with exactly-once written commits and continuous real-time load balancing on a single topic on the same broker. This ensures data integrity and efficient read/write operations for maximal performance.
- This functionality is achieved through a custom Kafka streams API implementation which gets attached to the provided topic.
- It replicates the data in real-time as an independent consumer and producer to the Kafka topic, ensuring no interference with native consumers and producers.

## Table of Contents

- Pre-requisites
- Features
- How it works
- Demo Testing App
- Installation
- Feature roadmap
- Contribute
- License

## Pre-requisites

To use this application, you'll need to have :

1. Either a locally hosted or publically-available cloud hosted Kafka instance
2. If you have a locally hosted instance, please use the Desktop Application.

## Features

Saamsa has the following features:

- An intuitive GUI.
- Insights into brokers, consumers, topics, offsets, partition indices
- Graphs to visualize & monitor load balancing on a topic level
- Ability to rebalance message-offset load on a topic

## How it works

**Getting started with Saamsa is easy:**

1. Download <a href='https://saamsa.io/download' onclick="return ! window.open(this.href);">the app for MacOS</a> or visit <a href='https://saamsa.io' onclick="return ! window.open(this.href);">the web application</a>
2. Sign up if you are a new user. Otherwise, log in.
3. To add a new broker address, add the location in the input field and click _Submit_.
4. To use an already submitted broker address, Click on the dropdown next to _Select broker_ and choose the preferred broker.
5. _Select a topic_ from the dropdown.
6. You can now see a graphical visualization of your Saamsa topic on the selected broker.

**To customize load balancing:**

1. Select the broker and the topic who's load balancing you want to customize.
2. Click on the "customize load balancing" button to customize load balancing for the selected topic.
3. The display will automatically change to display this balanced topic after a second or two.
4. You can now see load balancing customized on the selected topic.

## Demo Testing App

We have created a demo testing app for you to understand how Saamsa works with an application that:

- Uses Kafka as its message broker
- Creates consumers that read data upon button click
- Created producers that produce massive amounts of data upon button click

To use our Demo app, all you have to do is:

### Remotely

1. Navigate to <a href='https://demo.saamsa.io' onclick="return ! window.open(this.href);">demo.saamsa.io</a>
2. This is a publically available Kafka/Zookeeper instance with controls to produce data, consume data, and create topics.

### Locally

1. Clone this repo.
2. Install Docker Desktop.
3. From the cloned repo's directory, run `$ docker compose up -d`
   This opens up a local Kafka/Zookeepr instance at localhost:29092, localhost:2181.
   A GUI for easily producing data, consuming data, and creating topics for this broker is available at localhost:3000.

## Installation

To use our <a href='https://saamsa.io' onclick="return ! window.open(this.href);">Web Application</a>/<a href='https://saamsa.io/download' onclick="return ! window.open(this.href);">Desktop Application for MacOS</a>, please follow steps 1 - 6 of Getting started with Saamsa, which can be found above.

## Feature Roadmap

The development team intends to continue improving Saamsa and adding more features.
[Head to our roadmap](https://github.com/oslabs-beta/saamsa/issues) to see our upcoming planned features.

## Contributors

[Adam Thibodeaux](https://github.com/adam-thibodeaux) - [LinkedIn](https://www.linkedin.com/in/adam-thibodeaux-b0812b210/)
<br>
[Shamilah Faria](https://github.com/shamilahfaria) - [LinkedIn](https://www.linkedin.com/in/shamilah-faria/)
<br>
[Janilya Baizack](https://github.com/janilya) - [LinkedIn](https://www.linkedin.com/in/janilya/)
<br>
[Kasthuri Menon](https://github.com/kasthurimenon) - [LinkedIn](https://www.linkedin.com/in/kasthurimenon)
<br>

If you'd like to support the active development of Saamsa:

- Add a GitHub Star to the project.
- Tweet about the project on your Twitter.
- Write a review or tutorial on Medium, Dev.to or personal blog.
- Contribute to this project by raising a new issue or making a PR to solve an issue.
<hr>
