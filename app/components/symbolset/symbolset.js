angular.module('symbolApp')
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('symbolSet', {
                url: '/symbolset/:symbolSetId',
                views: {
                    body: {
                        templateUrl: 'app/components/symbolset/symbolset.html',
                        controller: 'SymbolSetBrowserCtrl'
                    },
                    side: {
                        templateUrl: 'app/components/symbolset/symbolset.side.html',
                        controller: 'SymbolsetSideCtrl'
                    }

                }

            })
            .state('symbolSet.specialsubtypes', {url: "#specialsubtypes"})
            .state('symbolSet.symboltable', {url: "#symboltable"})
            .state('symbolSet.modifierone', {url: "#modifierone"})
            .state('symbolSet.modifiertwo', {url: "#modifiertwo"})
    })

    .factory('currentSymbol', ['$log', 'config', function ($log, config) {
        var symb = {
            entity: null,
            entityFn: config.BLANK_PATH,
            frameFn: config.BLANK_PATH,
            mod1Fn: config.BLANK_PATH,
            mod2Fn: config.BLANK_PATH
        };
        return {
            symb: symb
        };
    }])

    .factory('symbolsetBrowserSettings', ['$log', 'config', function ($log, config) {
        var settings = {
            useCivilianFrames: false,
            showDebugInfo: false,
            showLimitUseToOnly: false,
            currentSymbolSet: null,

        };
        return {
            settings: settings
        };
    }])

    .controller('SymbolsetSideCtrl', ["$scope", "$timeout", "symbolsetBrowserSettings", "currentSymbol", function ($scope, $timeout, symbolsetBrowserSettings, currentSymbol) {
        $scope.symbolData = symbolData;
        $scope.symb = currentSymbol.symb;
        $scope.settings = symbolsetBrowserSettings.settings;
        $scope.redrawSymbolSet = function () {
            var tmp = $scope.settings.currentSymbolSet;
            $timeout(function () {
                $scope.settings.currentSymbolSet = null;
            });
            $timeout(function () {
                $scope.settings.currentSymbolSet = tmp;
            });
        };

    }])

    .controller('SymbolSetBrowserCtrl', ['$scope', '$stateParams', '$log', '$timeout',
        'symbolIdCodeService', 'config', 'symbolsetBrowserSettings',
        function ($scope, $stateParams, $log, $timeout, symbolIdCodeService, config, symbolsetBrowserSettings) {
            $scope.settings = symbolsetBrowserSettings.settings;
            if ($stateParams.symbolSetId) {
                var tmp = findWithAttr(symbolData.symbolSets, 'id', $stateParams.symbolSetId);
                if (tmp) {
                    $scope.settings.currentSymbolSet = tmp;
                } else {
                    $scope.settings.currentSymbolSet = symbolIdCodeService.symbId.symbolSet;
                }
            } else {
                if (!$scope.settings.currentSymbolSet) {
                    $scope.settings.currentSymbolSet = symbolIdCodeService.symbId.symbolSet;
                }
            }
            $scope.symbolData = symbolData;


            var SVG_PATH = config.SVG_PATH;
            $scope.SVG_PATH = SVG_PATH;

            $scope.$watch('settings.currentSymbolSet', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    changeSymbolSet(newVal)
                }
            });

            function changeSymbolSet(symbolSet) {
                if (!symbolSet)  {
                    $scope.currentSymbolSet = symbolSet;
                    return;
                };
                $scope.ttest = symbolSet.id;
                $scope.modonepath = SVG_PATH + symbolSet.graphicFolder["modifierOnes"] + "/";
                $scope.modtwopath = SVG_PATH + symbolSet.graphicFolder["modifierTwos"] + "/";
                if (symbolSet.id == "SS_AIR_MISSILE" || symbolSet.id == "SS_SPACE_MISSILE") {
                    $scope.currentBoundingOctagon = "assets/img/BoundingOctagonVertical.svg";
                } else {
                    $scope.currentBoundingOctagon = "assets/img/BoundingOctagonHorizontal.svg";
                }
                $scope.currentSymbolSet = symbolSet;
            };

            changeSymbolSet($scope.settings.currentSymbolSet);
            $scope.getLabel = function (element) {
                return element.digits + " " + element.label;
            };


        }])

    .controller('SidebarCtrl', ['$scope', 'currentSymbol', 'symbolsetBrowserSettings', function ($scope, currentSymbol, symbolsetBrowserSettings) {
        $scope.currentSymbolSet = $scope.$parent.currentSymbolSet;
        $scope.symb = currentSymbol.symb;
        $scope.settings = symbolsetBrowserSettings.settings;

    }])

    .directive('symbsetsymb', ['$log', 'config', 'pathService', 'currentSymbol', 'symbolsetBrowserSettings', function ($log, config, pathService, currentSymbol, symbolsetBrowserSettings) {
        function link(scope, element, attrs) {
            scope.entityFn = "";
            var currentSymbolSet = scope.$parent.currentSymbolSet;
            var dimensionId = currentSymbolSet.dimensionId,
                contextId = 'REALITY',
                siId = scope.si || "SI_UNKNOWN";

            scope.entityFn = pathService.getEntityFilePath(scope.entity, currentSymbolSet, siId) || config.BLANK_PATH;
            if (scope.entity.id == 'OWN_SHIP') {
                scope.frameFn = config.BLANK_PATH;
            } else {
                scope.frameFn = pathService.getFrameFilePath(contextId, siId, currentSymbolSet, null, symbolsetBrowserSettings.settings.useCivilianFrames) || config.BLANK_PATH;
            }
            element.bind('click', function () {
                scope.$apply(function () {
                    currentSymbol.symb.entity = scope.entity;
                    currentSymbol.symb.entityFn = scope.entityFn;
                    currentSymbol.symb.frameFn = scope.frameFn;
                });
            })
        }

        return {
            restrict: 'E',
            scope: {
                entity: '=',
                si: '@'
            },
            template: function (element, attrs) {
                return '<div class="milsymbol">'
                    + '<img class="symbol-sm" ng-src="{{frameFn}}">'
                    + '<img class="symbol-sm" ng-src="{{entityFn}}">'
                    + '</div>';
            },
            link: link
        };
    }])

    .directive('symbsetmod1', ['$log', 'config', 'pathService', 'currentSymbol', function ($log, config, pathService, currentSymbol) {
        function link(scope, element, attrs) {
            element.bind('click', function () {
                scope.$apply(function () {
                    currentSymbol.symb.mod1Fn = scope.modonepath + scope.modone.graphic;
                });
            });
        }

        return {
            restrict: 'E',
            template: function (element, attrs) {
                return '<div class="milsymbol symbol-smm">'
                    + '<img ng-src="{{currentBoundingOctagon}}">'
                    + '<img class="symbol-sm" ng-src="{{modonepath+modone.graphic}}">'
                    + '</div>';
            },
            link: link
        };
    }])

    .directive('symbsetmod2', ['$log', 'config', 'pathService', 'currentSymbol', function ($log, config, pathService, currentSymbol) {
        function link(scope, element, attrs) {
            element.bind('click', function () {
                scope.$apply(function () {
                    currentSymbol.symb.mod2Fn = scope.modtwopath + scope.modtwo.graphic;
                });
            });
        }

        return {
            restrict: 'E',
            template: function (element, attrs) {
                return '<div class="milsymbol symbol-smm">'
                    + '<img ng-src="{{currentBoundingOctagon}}">'
                    + '<img class="symbol-sm" ng-src="{{modtwopath+modtwo.graphic}}">'
                    + '</div>';
            },
            link: link
        };
    }])

    .directive('controlmeasure', ['$log', 'config', 'pathService', 'currentSymbol', function ($log, config, pathService, currentSymbol) {

        function link(scope, element, attrs) {
            scope.entityFn = "";
            var currentSymbolSet = scope.$parent.currentSymbolSet;
            var gg = scope.entity;
            scope.entityFn = pathService.getEntityFilePath(scope.entity, currentSymbolSet) || config.BLANK_PATH;
            element.bind('click', function () {
                scope.$apply(function () {
                    currentSymbol.symb.entity = scope.entity;
                    currentSymbol.symb.entityFn = scope.entityFn;
                });
            })
        }

        return {
            restrict: 'E',
            scope: {
                entity: '='
            },
            template: function (element, attrs) {
                return '<div class="control-measure"><img class="control-measure-sm" ng-src="{{entityFn}}"/></div>';
            },
            link: link
        };
    }])

    .filter('limitUseToFilter', function () {
        return function (input, isEnabled) {
            if (isEnabled) {
                return input.filter(function (item) {
                    return item.limitUseTo
                });
            } else {
                return input
            }
        };
    });
