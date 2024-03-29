'use strict';
const angular = require('angular');

export default angular.module('feedbackApp.ngTagModule', [])
  .directive('ngTagModule', function($log, $timeout) {
    return {
      restrict: 'EA',
      scope: {

        cloudWidth: '=?',
        cloudHeight: '=?',
        cloudOverflow: '=?',
        cloudData: '='
      },
      template: "<div id='ng-tag-cloud' class='ng-tag-cloud'></div>",
      controller: function($scope, $element) {},
      link: function($scope, element, attrs) {

        if ($scope.cloudData === "" || $scope.cloudData === undefined) {
          $log.error(
            "ng-tag-cloud: No data passed. Please pass tags data as json. <ng-tag-cloud cloud-data='tagsJSON'></ng-tag-cloud\nFor more info see here: https://github.com/zeeshanhyder/angular-tag-cloud"
          );
          return;
        }
        $scope.$watchCollection('[cloudData]', function() {
          $timeout(function() {
            buildOptions();
            drawWordCloud();
          }, 10);
        });

        //default options
        var options = {
          width: $scope.cloudWidth ? $scope.cloudWidth : "300",
          height: $scope.cloudHeight ? $scope.cloudHeight : "300"
        };
        // Reference to the container element
        var $this = angular.element(element)[0];
        // Namespace word ids to avoid collisions between multiple clouds
        var cloud_namespace = $this.getAttribute('id') || Math.floor((Math.random() * 1000000))
          .toString(36);

        var word_array = [];
        var buildOptions = function() {
          word_array = $scope.cloudData;

          $this.style.width = options.width + "px";
          $this.style.height = options.height + "px";
          // Default options value
          var default_options = {
            width: $this.offsetWidth,
            height: $this.offsetHeight,
            center: {
              x: (options.width / 2.0),
              y: (options.height / 2.0)
            },
            delayedMode: word_array.length > 50,
            shape: false, // It defaults to elliptic shape
            encodeURI: true,
            removeOverflowing: $scope.cloudOverflow ? false : true //TRUE by default. I know this is confusing, will be changed in next versions.
          };
          options = angular.extend(default_options, options || {});
        }

        buildOptions();

        // Container's CSS position cannot be 'static'
        if ($this.style.position === "static" || $this.style.position === "") {
          $this.style.position === "relative";
        }

        var drawWordCloud = function() {
          element.empty();
          // Helper function to test if an element overlaps others
          var hitTest = function(elem, other_elems) {
            // Pairwise overlap detection
            var overlapping = function(a, b) {
              if (Math.abs(2.0 * a.offsetLeft + a.offsetWidth - 2.0 * b.offsetLeft - b.offsetWidth) <
                a.offsetWidth + b.offsetWidth) {
                if (Math.abs(2.0 * a.offsetTop + a.offsetHeight - 2.0 * b.offsetTop - b.offsetHeight) <
                  a.offsetHeight + b.offsetHeight) {
                  return true;
                }
              }
              return false;
            };
            var i = 0;
            // Check elements for overlap one by one, stop and return false as soon as an overlap is found
            for (i = 0; i < other_elems.length; i++) {
              if (overlapping(elem, other_elems[i])) {
                return true;
              }
            }
            return false;
          };

          // Make sure every relevance is a number before sorting
          for (var i = 0; i < word_array.length; i++) {
            word_array[i].relevance = parseFloat(word_array[i].relevance, 10);
          }

          // Sort word_array from the word with the highest relevance to the one with the lowest
          word_array.sort(function(a, b) {
            if (a.relevance < b.relevance) {
              return 1;
            } else if (a.relevance > b.relevance) {
              return -1;
            } else {
              return 0;
            }
          });

          var step = (options.shape === "rectangular") ? 18.0 : 2.0,
            already_placed_words = [],
            aspect_ratio = options.width / options.height;

          // Function to draw a word, by moving it in spiral until it finds a suitable empty place. This will be iterated on each word.
          var drawOneWord = function(index, word) {
            // Define the ID attribute of the span that will wrap the word, and the associated jQuery selector string
            var word_id = cloud_namespace + "_word_" + index,
              word_selector = "#" + word_id,
              angle = 6.28 * Math.random(),
              radius = 0.0,

              // Only used if option.shape == 'rectangular'
              steps_in_direction = 0.0,
              quarter_turns = 0.0,

              relevance = 5,
              custom_class = "",
              inner_html = "",
              word_span;

            // Leave out custom html for now.

            // Check if min(relevance) > max(relevance) otherwise use default
            if (word_array[0].relevance > word_array[word_array.length - 1].relevance) {
              // Linearly map the original relevance to a discrete scale from 1 to 10
              relevance = Math.round((word.relevance - word_array[word_array.length - 1].relevance) /
                (word_array[0].relevance - word_array[word_array.length - 1].relevance) *
                9.0) + 1;
            }

            // Create a new span and insert node.
            word_span = document.createElement("span");
            word_span.className = 'w' + relevance;
            var textNode = document.createTextNode(word.text);

            // Append href if there's a link alongwith the tag
            if (word.link !== undefined && word.link !== "") {
              // If link is a string, then use it as the link href
              if (typeof word.link === "string") {
                var href = word.link;
              }

              // Extend link html options with defaults
              if (options.encodeURI) {
                href = encodeURI(href).replace(/'/g, "%27");
              }

              var word_link = document.createElement("a");
              word_link.href = href;
              word_link.appendChild(textNode);
              word_span.appendChild(word_link);
            } else {

              // If there's no link attribute
              word_span.appendChild(textNode);
            }


            // Bind handlers to words (though not really useful in this version!)
            if (!!word.handlers) {
              for (var prop in word.handlers) {
                if (word.handlers.hasOwnProperty(prop) && typeof word.handlers[prop] ===
                  'function') {
                  word_span.addEventListener(prop, word.handlersp[prop]);
                }
              }
            }

            $this.appendChild(word_span);

            var width = word_span.offsetWidth,
              height = word_span.offsetHeight,
              left = options.center.x - width / 2.0,
              top = options.center.y - height / 2.0;

            // Save a reference to the style property, for better performance
            var word_style = word_span.style;
            word_style.position = "absolute";
            word_style.left = left + "px";
            word_style.top = top + "px";

            while (hitTest(word_span, already_placed_words)) {
              // option shape is 'rectangular' so move the word in a rectangular spiral
              if (options.shape === "rectangular") { //not enabled in this version.
                steps_in_direction++;
                if (steps_in_direction * step > (1 + Math.floor(quarter_turns / 2.0)) *
                  step * ((quarter_turns % 4 % 2) === 0 ? 1 : aspect_ratio)) {
                  steps_in_direction = 0.0;
                  quarter_turns++;
                }
                switch (quarter_turns % 4) {
                  case 1:
                    left += step * aspect_ratio + Math.random() * 2.0;
                    break;
                  case 2:
                    top -= step + Math.random() * 2.0;
                    break;
                  case 3:
                    left -= step * aspect_ratio + Math.random() * 2.0;
                    break;
                  case 0:
                    top += step + Math.random() * 2.0;
                    break;
                }
              } else { // Default settings: elliptic spiral shape
                radius += step;
                angle += (index % 2 === 0 ? 1 : -1) * step;

                left = options.center.x - (width / 2.0) + (radius * Math.cos(angle)) *
                  aspect_ratio;
                top = options.center.y + radius * Math.sin(angle) - (height / 2.0);
              }
              word_style.left = left + "px";
              word_style.top = top + "px";
            }

            // Don't render word if part of it would be outside the container
            if (options.removeOverflowing && (left < 0 || top < 0 || (left + width) >
                options.width || (top + height) > options.height)) {
              word_span.remove()
              return;
            }


            already_placed_words.push(word_span);

            // Invoke callback if existing
            if (typeof(word.afterWordRender) === "function") {
              word.afterWordRender.call(word_span);
            }
          };

          var drawOneWordDelayed = function(index) {
            index = index || 0;
            if ($this.offsetWidth <= 0 && $this.offsetHeight <= 0) { // if not visible then do not attempt to draw
              $timeout(function() {
                drawOneWordDelayed(index);
              }, 10);
              return;
            }
            if (index < word_array.length) {
              drawOneWord(index, word_array[index]);
              $timeout(function() {
                drawOneWordDelayed(index + 1);
              }, 10);
            } else {
              if (typeof(options.afterCloudRender) === "function") {
                options.afterCloudRender.call($this);
              }
            }
          };

          // Iterate drawOneWord on every word. The way the iteration is done depends on the drawing mode (delayedMode is true or false)
          if (options.delayedMode) {
            drawOneWordDelayed();
          } else {

            word_array.forEach(function(elem, index) {
              drawOneWord(index, elem);
            });
            if (typeof(options.afterCloudRender) === "function") {
              options.afterCloudRender.call($this);
            }
          }
        };

        // Delay execution so that the browser can render the page before the computatively intensive word cloud drawing
        $timeout(function() {
          drawWordCloud();
        }, 10);

      },
      replace: true
    };
  })
  .name;
