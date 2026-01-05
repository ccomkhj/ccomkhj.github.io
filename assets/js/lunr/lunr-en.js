---
layout: none
---

var idx = lunr(function () {
  this.field('title')
  this.field('excerpt')
  this.field('categories')
  this.field('tags')
  this.ref('id')

  this.pipeline.remove(lunr.trimmer)

  for (var item in store) {
    this.add({
      title: store[item].title,
      excerpt: store[item].excerpt,
      categories: store[item].categories,
      tags: store[item].tags,
      id: item
    })
  }
});

$(document).ready(function() {
  $('input#search').on('keyup', function () {
    var resultdiv = $('#results');
    var query = $(this).val().toLowerCase();
    var result =
      idx.query(function (q) {
        query.split(lunr.tokenizer.separator).forEach(function (term) {
          q.term(term, { boost: 100 })
          if(query.lastIndexOf(" ") != query.length-1){
            q.term(term, {  usePipeline: false, wildcard: lunr.Query.wildcard.TRAILING, boost: 10 })
          }
          if (term != ""){
            q.term(term, {  usePipeline: false, editDistance: 1, boost: 1 })
          }
        })
      });
    resultdiv.empty();
    resultdiv.prepend('<p class="results__found">'+result.length+' {{ site.data.ui-text[site.locale].results_found | default: "Result(s) found" }}</p>');
    for (var item in result) {
      var ref = result[item].ref;
      var tags = store[ref].tags;
      var tagString = "None";
      if (tags) {
         if (Array.isArray(tags)) {
             tagString = tags.join(", ");
         } else {
             tagString = tags;
         }
      }

      var searchitem =
        '<div class="search-result-item">' +
          '<a href="' + store[ref].url + '">' + store[ref].title + '</a>' +
          '<span class="excerpt">' + store[ref].excerpt.split(" ").splice(0,20).join(" ") + '...</span>' +
          '<div class="meta">Tags: ' + tagString + ' | Date: ' + (store[ref].date || "N/A") + '</div>' +
        '</div>';
      resultdiv.append(searchitem);
    }
  });
});
