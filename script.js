angular.module('app', []).controller('MainCtrl', function($scope, $http) {
  var group = 0;
  $http.get('attendees.local.csv').then(function(response) {
    var data = CSV.parse(response.data, {headers: true});
    var allData = data.splice(8*group,8);
    // var allData = [getRandomItem(data)];
    $scope.userGroupGroups = splitIntoGroups(splitIntoGroups(allData, 2), 4);
  });

  function getRandomItem(items) {
    return items[Math.floor(Math.random()*items.length)];
  }

  $scope.idIsNumber = isNumberOrNull;
  function splitIntoGroups(arry, size) {
    var totalGroups = Math.ceil(arry.length / size);
    var group = [];
    for (var i = 0; i < totalGroups; i++) {
      var aGroup = arry.slice(i * size, (i + 1) * size);
      group.push(aGroup);
    }
    return group;
  }
}).directive('userImage', function($http) {
  return {
    restrict: 'E',
    template: function() {
      return [
        '<img class="user-image img-circle" ng-src="{{imageSrc || \'default-image.jpg\'}}"></img>'
      ].join('')
    },
    scope: {
      email: '=?',
      id: '=?'
    },
    link: function(scope, el, attrs) {
      if (!scope.email && !scope.id) {
        return;
      }
      var emailTried = !scope.email;
      var idTried = !scope.id;

      getImage();

      function getImage() {
        var inUrl;
        var url = null;

        if (!emailTried) {
          url = 'http://picasaweb.google.com/data/entry/api/user/' + scope.email + '?alt=json'
          emailTried = true;
        } else if (!idTried) {
          url = 'https://www.googleapis.com/plus/v1/people/' + scope.id + '?fields=image,url&key=AIzaSyCsGneFtzC6x9MDx03aqS2LkGYUCKBQdDk';
          idTried = true;
        }
        if (!url) {
          return;
        }
        $http.get(url).then(function(response) {
          if (response.data.entry) {
            console.log('success with email', scope.email);
            scope.imageSrc = response.data.entry.gphoto$thumbnail.$t;
          } else if (response.data.image && response.data.image.url) {
            console.log('Success with id', scope.id);
            scope.imageSrc = response.data.image.url;
            if (isNumberOrNull(scope.id) && ~response.data.url.indexOf('+')) {
              var newId = response.data.url.substring(response.data.url.indexOf('+'), response.data.url.length);
              if (newId !== scope.id) {
                console.log('changed from ', scope.id, ' to ', newId);
              }
              scope.id = newId;
            }
          }
        }, function(error) {
          console.log('no user found', scope.id, scope.email);
          getImage();
        });
      }
    }
  }
});

function isNumberOrNull(id) {
  return !id || !!~~id;
}