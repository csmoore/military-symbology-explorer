angular.module('symbolApp')
    .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/home');
        $urlRouterProvider.when('/main/', '/explore/');
        $stateProvider

            // HOME STATES AND NESTED VIEWS ========================================
            .state('home', {
                url: '/home',
                views: {
                    body: {templateUrl: 'app/components/home/home.html'}
                }
            })
            .state('frames', {
                url: '/frames',
                views: {
                    body: {templateUrl: 'app/components/frames/frames.html'}
                }

            })
            .state('frames.reality', {url: "#reality"})
            .state('frames.exercise', {url: "#exercise"})
            .state('frames.simulation', {url: "#simulation"})

            .state('search', {
                url: '/search',
                views: {
                    body: {templateUrl: 'app/components/search/search.html'}
                }
            })

            .state('about', {
                url: '/about',
                views: {
                    body: {templateUrl: 'app/components/about/about.html'}
                }

            });
    });
