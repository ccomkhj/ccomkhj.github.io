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
        '<div class="window" style="margin-bottom: 1.5rem;">' +
          '<div class="title-bar">' +
            '<div class="title-bar-text">' + store[ref].title + '</div>' +
            '<div class="title-bar-controls">' +
              '<button aria-label="Minimize"></button>' +
              '<button aria-label="Maximize"></button>' +
              '<button aria-label="Close"></button>' +
            '</div>' +
          '</div>' +
          '<div class="window-body" style="padding: 6px;">' +
            (store[ref].teaser ? 
              '<div class="archive__item-teaser" style="margin-bottom: 6px;">' +
                '<img src="' + store[ref].teaser + '" alt="" style="max-width: 100%; max-height: 120px; object-fit: cover; border: 2px inset #dfdfdf;">' +
              '</div>' : ''
            ) +
            '<p class="archive__item-excerpt" style="margin-bottom: 0.5rem; font-size: 13px;">' + 
              store[ref].excerpt.split(" ").splice(0,15).join(" ") + '...' + 
            '</p>' +
            '<div class="field-row" style="justify-content: flex-end; margin-top: 4px;">' +
              '<button onclick="window.location.href=\'' + store[ref].url + '\'">View</button>' +
            '</div>' +
          '</div>' +
          '<div class="status-bar">' +
            '<p class="status-bar-field">' + tagString + '</p>' +
          '</div>' +
        '</div>';
      resultdiv.append(searchitem);
    }
  });
});
