// Define the `phonecatApp` module
var myApp = angular.module('myApp', ['ngRoute']);

myApp.config(['$locationProvider', '$routeProvider',
    function config($locationProvider, $routeProvider) {
      // $locationProvider.hashPrefix('!');

      $routeProvider.
        when('/', {
          templateUrl: 'templates/home.html'
        }).
        when('/register', {
          templateUrl: 'templates/register.html',
          controller: 'registerCtrl'
        }).
        when('/login', {
          templateUrl: 'templates/login.html',
          controller: 'loginCtrl'
        }).
        when('/logout', {
          template: '<script>alert("Logout Succesfull!");</script>',
          controller: 'logoutCtrl'
        }).
        when('/kitchen', {
          templateUrl: 'templates/kitchen.html',
          controller: 'productsCtrl'
        }).
        when('/kitchen/:name', {
          templateUrl: 'templates/kitchen.html',
          controller: 'productsCtrl'
        });
    }
  ]);

myApp.directive('compareTo', [function() {
    return {
      require: "ngModel",
      scope: {
        otherModelValue: "=compareTo"
      },
      link: function(scope, element, attributes, ngModel) {

        ngModel.$validators.compareTo = function(modelValue) {
          return modelValue == scope.otherModelValue;
        };

        scope.$watch("otherModelValue", function() {
          ngModel.$validate();
        });
      }
    };
}])

myApp.controller('defaultCtrl', ['$scope', function ($scope) {
  // var ref = new Firebase("https://myapp-61760.firebaseio.com/");
  // console.log($rootScope.user);
  $scope.init = function() {
    $scope.namelnk = "#/login";
    $scope.name = "Login";
    $scope.reglnk = "#/register";
    $scope.reg = "Register";
  };
    firebase.auth().onAuthStateChanged(function(user) {
      if(user){
        // console.log(user);
        firebase.database().ref('/users/' + user.uid).once('value').then(function(snapshot) {
          var username = snapshot.val().username;
          $scope.namelnk = "#/";
          $scope.name = username;
          $scope.reglnk = "#/logout";
          $scope.reg = "Logout";
        });
      } else {
          $scope.namelnk = "#/login";
          $scope.name = "Login";
          $scope.reglnk = "#/register";
          $scope.reg = "Register";
      }
    });
  
}])

myApp.controller('logoutCtrl', ['$scope', '$location', function ($scope, $location) {
  firebase.auth().onAuthStateChanged(function(user) {
    if(user) {
      firebase.auth().signOut();
      $location.path('/');
    } else {
      $location.path('/login');
    }
  });
}])

myApp.controller('loginCtrl', ['$scope', '$rootScope', '$location', function ($scope, $rootScope, $location) {
  $scope.error = "";
  $scope.email = "Email";
  $scope.emailFormat = "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$";
  $scope.password = "password";
  $scope.submit = function(){
    $scope.Err = false;
    var email = $scope.email;
    var password = $scope.password;
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error, user){
          if (error.code === 'auth/wrong-password') {
            $scope.Err = true;
            $scope.error = "Wrong Password!";
          } else {
            console.error(error);
          }
      // $rootScope.user = user;
      // firebase.database().ref('/users/' + user.uid).once('value').then(function(snapshot) {
      //   var username = snapshot.val().username;
      //   $rootScope.namelnk = "#/";
      //   $rootScope.name = username;
      //   $rootScope.reglnk = "#/logout";
      //   $rootScope.reg = "Logout";
      // });
    });
    $location.path('/');
  };
}])

myApp.controller('registerCtrl', ['$scope', function ($scope) {
  $scope.error = "";
  $scope.username = "Username";
  $scope.email = "Email";
  $scope.emailFormat = "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$";
  $scope.password1 = "password";
  $scope.password2 = "password";
  $scope.submit = function(){
    if ($scope.password1 == $scope.password2) {
      var email = $scope.email;
      var password = $scope.password1;
      $scope.Err = false;
      // console.log($scope);
      // [START createwithemail]
      firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // [START_EXCLUDE]
        if (errorCode == 'auth/weak-password') {
          alert('The password is too weak.');
        } else {
          console.error(error);
        }
        // [END_EXCLUDE]
      }).then(function(){
        firebase.auth().signInWithEmailAndPassword(email, password);
        firebase.auth().onAuthStateChanged(function(user) {
          if(user){
            console.log(user);
            writeUserData(user.uid, $scope.username, email);
            firebase.auth().signOut();
          }
        }); 
      });

           
      
      // [END createwithemail]
    }
    else{
      $scope.Err = true;
      $scope.error = "Passwords do not match!";
    }
  };
}])

// Define the `PhoneListController` controller on the `phonecatApp` module
myApp.controller('PhoneListController', function PhoneListController($scope) {
  $scope.phones = [
    {
      name: 'Nexus S',
      snippet: 'Fast just got faster with Nexus S.'
    }, {
      name: 'Motorola XOOM™ with Wi-Fi',
      snippet: 'The Next, Next Generation tablet.'
    }, {
      name: 'MOTOROLA XOOM™',
      snippet: 'The Next, Next Generation tablet.'
    }
  ];
});

myApp.controller('productsCtrl', ['$scope', '$routeParams', function ($scope, $routeParams) {
  if($routeParams.name) {
    firebase.database().ref('/products').once('value').then(function(data){
      $scope.products = data.val();
      console.log(data.val());
    });
  } else {

  }
}])

function writeUserData(userId, name, email) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email
  });
}