'use strict';

function Article (opts) {
  // REVIEW: Convert property assignment to a new pattern. Now, ALL properties of `opts` will be
  // assigned as properies of the newly created article object. We'll talk more about forEach() soon!
  // We need to do this so that our Article objects, created from DB records, will have all of the DB columns as properties (i.e. article_id, author_id...)
  Object.keys(opts).forEach(function(e) {
    this[e] = opts[e]
  }, this);
}

Article.all = [];

// ++++++++++++++++++++++++++++++++++++++

// REVIEW: We will be writing documentation today for the methods in this file that handles Model layer of our application. As an example, here is documentation for Article.prototype.toHtml(). You will provide documentation for the other methods in this file in the same structure as the following example. In addition, where there are TODO comment lines inside of the method, describe what the following code is doing (down to the next TODO) and change the TODO into a DONE when finished.

/**
 * OVERVIEW of Article.prototype.toHtml():
 * - A method on each instance that converts raw article data into HTML
 * - Inputs: nothing passed in; called on an instance of Article (this)
 * - Outputs: HTML of a rendered article template
 */
Article.prototype.toHtml = function() {
  // DONE: Retrieves the  article template f    rom the DOM and passes the template as an argument to the Handlebars compile() method, with the resulting function being stored into a variable called 'template'.
  var template = Handlebars.compile($('#article-template').text());

  // DONE: Creates a property called 'daysAgo' on an Article instance and assigns to it the number value of the days between today and the date of article publication
  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // DONE: Creates a property called 'publishStatus' that will hold one of two possible values: if the article has been published (as indicated by the check box in the form in new.html), it will be the number of days since publication as calculated in the prior line; if the article has not been published and is still a draft, it will set the value of 'publishStatus' to the string '(draft)'
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';

  // DONE: Assigns into this.body the output of calling marked() on this.body, which converts any Markdown formatted text into HTML, and allows existing HTML to pass through unchanged
  this.body = marked(this.body);

// DONE: Output of this method: the instance of Article is passed through the template() function to convert the raw data, whether from a data file or from the input form, into the article template HTML
  return template(this);
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - This method sorts the rows (article data) and pushes them to the Article.all array.
 * - Inputs: The input is 'results' from inside the Article.fetchAll method.
 * - Outputs: The output is a new Article object that is pushed to the Article.all array.
 */
Article.loadAll = function(rows) {
  // DONE: The following code is sorting the rows (article data) using a function that compares the first article's publishedOn Data to the next. I'm mostly sure its being sorted in descending order, so the newest article is first.
  rows.sort(function(a,b) {
    return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
  });

  // DONE: The following code is creating a new Article object for each of the rows (articles) and pushing them to the Article.all array.
  rows.forEach(function(ele) {
    Article.all.push(new Article(ele));
  })
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - This method is checking to see if the 'articles' table in the database already exists, and if it does, either sending it's contents to the loadAll method or getting the rawData from hackerIpsum.json and inserting it to the database, and running fetchAll again to send results to loadAll. BOTTOM LINE: fetchAll gets the articles from wherever they are and handles them accordingly to get them to loadAll.
 * - Inputs: The fetchAll method is called in index.html where it is passed articleView.initIndexPage, which is a method that is used as 'callback.' Further inputs are the articles from a jQuery request (HTTP request?). Also, there is another request that gets the articles from hackerIpsum.json.
 * - Outputs: Outputs are either the results to the loadAll method, the insertion of new Article objects to database, or the console.log of an 'err.'
 */
Article.fetchAll = function(callback) {
  // DONE: The following code is requesting the articles from the articles table in the database.
  $.get('/articles')
  // DONE: After the request, .then gives either results on success (and we use functions to handle the results), or err on failure (which we use .catch for).
  .then(
    function(results) {
      if (results.length) { // If records exist in the DB
        // DONE: If the records exist in DB, the results are passed to the loadAll method and call callback, which is actually articleView.initIndexPage method, but only after loadAll has been called.
        Article.loadAll(results);
        callback();
      } else { // if NO records exist in the DB
        // DONE: If no record exist in the DB, hackerIpsum.json (our raw article data) is requested, and new article objects are instantiated and inserted to the DB with article.insertRecord.
        $.getJSON('./data/hackerIpsum.json')
        .then(function(rawData) {
          rawData.forEach(function(item) {
            let article = new Article(item);
            article.insertRecord(); // Add each record to the DB
          })
        })
        // DONE: After the record has been inserted, we use .then to call fetchAll again, to start from the top and .get the articles from the DB and send them to loadAll and initIndexPage.
        .then(function() {
          Article.fetchAll(callback);
        })
        // DONE: If for whatever reason a .then fails, we get and error the .catch handles by console logging the error response.
        .catch(function(err) {
          console.error(err);
        });
      }
    }
  )
};

// ++++++++++++++++++++++++++++++++++++++

// TODO
/**
 * OVERVIEW of
 * - This method is used to delete the entire articles table from the DB.
 * - Inputs: Not 100% on this, but the method isn't called in the code, but only if the user calls it in the console...
 * - Outputs: The output is the deletion request to server.js and a console.log of the data it gets back?
 */
Article.truncateTable = function(callback) {
  // DONE: It's making an ajax request to the DB articles table for deletion.
  $.ajax({
    url: '/articles',
    method: 'DELETE',
  })
  // DONE: After the delete request we use .then method to log to the console the response data, and if something is passed as an argument to the truncateTable method, we call the method that is passed.
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};

// ++++++++++++++++++++++++++++++++++++++

// TODO
/**
 * OVERVIEW of
 * - Describe what the method does
 * - Inputs: identify any inputs and their source
 * - Outputs: identify any outputs and their destination
 */
Article.prototype.insertRecord = function(callback) {
  // TODO: describe what the following code is doing
  $.post('/articles', {author: this.author, authorUrl: this.authorUrl, body: this.body, category: this.category, publishedOn: this.publishedOn, title: this.title})
  // TODO: describe what the following code is doing
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  })
};

// ++++++++++++++++++++++++++++++++++++++

// TODO
/**
 * OVERVIEW of
 * - Describe what the method does
 * - Inputs: identify any inputs and their source
 * - Outputs: identify any outputs and their destination
 */
Article.prototype.deleteRecord = function(callback) {
  // TODO: describe what the following code is doing
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'DELETE'
  })
  // TODO: describe what the following code is doing
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};

// ++++++++++++++++++++++++++++++++++++++

// TODO
/**
 * OVERVIEW of
 * - Describe what the method does
 * - Inputs: identify any inputs and their source
 * - Outputs: identify any outputs and their destination
 */
Article.prototype.updateRecord = function(callback) {
  // TODO: describe what the following code is doing
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'PUT',
    data: {  // TODO: describe what this object is doing
      author: this.author,
      authorUrl: this.authorUrl,
      body: this.body,
      category: this.category,
      publishedOn: this.publishedOn,
      title: this.title
    }
  })
  // TODO: describe what the following code is doing
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};
