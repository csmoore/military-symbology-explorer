angular.module('symbolApp')
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('explore', {
                url: '/explore/:sic',
                views: {
                    side: {
                        templateUrl: 'app/components/symbol/symbol.side.html',
                        controller: "SidExplorerSettingsCtrl"
                    },
                    body: {
                        templateUrl: 'app/components/symbol/symbol.html',
                        controller: "SymbolCtrl"
                    }
                },


            })
    })

    .factory('symbolIdCodeService', ['$log', 'config', 'pathService', 'SicObject', function ($log, config, pathService, SicObject) {
        var symbolIdCode = {};
        var alternateAmplifiers = false;
        symbolIdCode.versionCode1 = "1";
        symbolIdCode.versionCode2 = "0";
        symbolIdCode.context = symbolData.contexts[0];
        symbolIdCode.standardIdentity = symbolData.standardIdentities[3];
        symbolIdCode.symbolSet = symbolData.symbolSets[4];
        symbolIdCode.status = symbolData.statuses[0];
        symbolIdCode.hqtfDummy = symbolData.hqtfDummies[0];
        symbolIdCode.amplifier = symbolData.amplifier[1];
        symbolIdCode.amplifierDescriptor = symbolData.amplifier[1].descriptors[5];
        symbolIdCode.entity = symbolIdCode.symbolSet.entities[1];
        symbolIdCode.entityType = symbolIdCode.entity.entityTypes[2];
        symbolIdCode.entitySubType = symbolIdCode.entityType.entitySubTypes[0];
        symbolIdCode.sectorOneModifier = null;
        symbolIdCode.sectorTwoModifier = null;
        symbolIdCode.useCivilianFrame = false;

        var service = {
            symbId: symbolIdCode,
            getEntityFn: getEntityFn,
            getSpecialEntitySubTypeFn: getSpecialEntitySubTypeFn,
            getFrameFn: getFrameFn,
            getStatusFn: getStatusFn,
            getHqtfdFn: getHqtfdFn,
            getAmplifierFn: getAmplifierFn,
            getModifierOneFn: getModifierOneFn,
            getModifierTwoFn: getModifierTwoFn,
            getAlternateAmplifiers: getAlternateAmplifiers,
            setAlternateAmplifiers: setAlternateAmplifiers,
            setStandardIdentity: function (standardIdentity) {
                symbolIdCode.standardIdentity = standardIdentity;
            },
            setContext: function (context) {
                symbolIdCode.context = context;
            },
            setSymbolSet: function (symbolSet) {
                symbolIdCode.symbolSet = symbolSet;
            },
            setStatus: function (status) {
                symbolIdCode.status = status;
            },
            setAmplifier: function (amplifer) {
                symbolIdCode.amplifier = amplifer;
            },
            setAmplifierDescriptor: function (amplifierDescriptor) {
                symbolIdCode.amplifierDescriptor = amplifierDescriptor;

            },
            setHQTFDummy: function (hqTFDummy) {
                symbolIdCode.hqtfDummy = hqTFDummy;
            },
            setEntity: function (entity) {
                symbolIdCode.entity = entity;
            },
            setEntityType: function (entityType) {
                symbolIdCode.entityType = entityType;
            },
            setEntitySubType: function (entitySubType) {
                symbolIdCode.entitySubType = entitySubType;
            },
            setSectorOneModifier: function (sectorOneModifier) {
                symbolIdCode.sectorOneModifier = sectorOneModifier || {"label": "Undefined", "digits": "00"};
            },
            setSectorTwoModifier: function (sectorTwoModifier) {
                symbolIdCode.sectorTwoModifier = sectorTwoModifier || {"label": "Undefined", "digits": "00"};
            },
            getSymbolIdentificationCode: function () {
                return computeSymbolIdentificationCode();
            },
            initializeFromSymbolIdentificationCode: function (sic) {
                var sicObj = new SicObject(sic, false);
                if (sicObj.invalid) {
                    $log.error('Invalid SIC. Could not initialize symbol');
                    return;
                }
                symbolIdCode.context = sicObj.contextObj;
                symbolIdCode.standardIdentity = sicObj.standardIdentityObj;
                symbolIdCode.symbolSet = sicObj.symbolSetObj;
                symbolIdCode.status = sicObj.statusObj;
                symbolIdCode.hqtfDummy = sicObj.hqtfdObj;
                symbolIdCode.amplifier = sicObj.amplifierObj;
                symbolIdCode.amplifierDescriptor = sicObj.amplifierDescriptorObj;
                symbolIdCode.entity = sicObj.entityObj;
                symbolIdCode.entityType = sicObj.entityTypeObj;
                symbolIdCode.entitySubType = sicObj.entitySubTypeObj;
                symbolIdCode.sectorOneModifier = sicObj.modifierOneObj;
                symbolIdCode.sectorTwoModifier = sicObj.modifierTwoObj;
            }
        };

        return service;


        function computeSymbolIdentificationCode() {
            var sic = symbolIdCode;
            var version = sic.versionCode1 + sic.versionCode2;
            var context = sic.context ? sic.context.digits : "0";
            var standardIdentity = sic.standardIdentity ? sic.standardIdentity.digits : "0";
            var symbolSet = sic.symbolSet ? sic.symbolSet.digits : "00";
            var status = sic.status ? sic.status.digits : "0";
            var hqtfDummy = sic.hqtfDummy ? sic.hqtfDummy.digits : "0";
            var amplifier = sic.amplifier ? sic.amplifier.digits : "0";
            var amplifierDescriptor = sic.amplifierDescriptor ? sic.amplifierDescriptor.digits : "0";
            var entity = sic.entity ? sic.entity.digits : "00";
            var entityType = sic.entityType ? sic.entityType.digits : "00";
            var entitySubType = sic.entitySubType ? sic.entitySubType.digits : "00";
            var mod1 = sic.sectorOneModifier ? sic.sectorOneModifier.digits : "00";
            var mod2 = sic.sectorTwoModifier ? sic.sectorTwoModifier.digits : "00";

            return version + context + standardIdentity + symbolSet + status + hqtfDummy + amplifier + amplifierDescriptor
                + entity + entityType + entitySubType + mod1 + mod2;

        }

        function getEntityFn() {
            var entity = symbolIdCode.entitySubType || symbolIdCode.entityType || symbolIdCode.entity;
            if (entity && entity.icon == 'SPECIAL') {
                entity = symbolIdCode.entityType;
            }
            return pathService.getEntityFilePath(entity, symbolIdCode.symbolSet, symbolIdCode.standardIdentity.id);
        }

        function getSpecialEntitySubTypeFn() {
            if (symbolIdCode.entitySubType && symbolIdCode.entitySubType.icon == "SPECIAL") {
                return pathService.getEntityFilePath(symbolIdCode.entitySubType, symbolIdCode.symbolSet, symbolIdCode.standardIdentity.id);
            } else {
                return null;
            }
        }

        function getFrameFn() {
            var entity = symbolIdCode.entitySubType || symbolIdCode.entityType || symbolIdCode.entity;
            if (entity && entity.id == 'OWN_SHIP') {
                return null;
            }
            var sic = symbolIdCode;
            return pathService.getFrameFilePath(sic.context.id, sic.standardIdentity.id, sic.symbolSet, sic.status, sic.useCivilianFrame);
        }

        function getStatusFn() {
            var sic = symbolIdCode;
            return pathService.getStatusFilePath(sic.standardIdentity.id, sic.symbolSet, sic.status, alternateAmplifiers);
        }

        function getHqtfdFn() {
            var sic = symbolIdCode;
            return pathService.getHqtfdFilePath(sic.standardIdentity.id, sic.symbolSet, sic.hqtfDummy);
        }

        function getAmplifierFn() {
            var sic = symbolIdCode;
            return pathService.getAmplifierFilePath(sic.standardIdentity.id, sic.amplifierDescriptor, sic.symbolSet);

        }

        function getModifierOneFn() {
            var sic = symbolIdCode;
            return pathService.getModifierOneFilePath(sic.sectorOneModifier, sic.symbolSet);
        }


        function getModifierTwoFn() {
            var sic = symbolIdCode;
            return pathService.getModifierTwoFilePath(sic.sectorTwoModifier, sic.symbolSet);
        }

        function getAlternateAmplifiers() {
            return alternateAmplifiers;
        }

        function setAlternateAmplifiers(alternateAmplifiersValue) {
            alternateAmplifiers = alternateAmplifiersValue;
        }


    }])

    .factory('sidExplorerSettings', [function () {
        settings = {
            showDebugInfo: false,
            useCivilianFrame: false,
            limitUseTo: true,
            alternateAmplifiers: false
        };
        return {
            settings: settings
        };
    }])

    .controller('SidExplorerSettingsCtrl', ["$scope", "sidExplorerSettings", function ($scope, sidExplorerSettings) {
        $scope.settings = sidExplorerSettings.settings;
    }])

    .controller('SymbolCtrl', ['$scope', '$log', '$stateParams', 'symbolIdCodeService', 'disableModOneFilter',
        'disableModTwoFilter', 'limitUseToModFilterFilter', 'sidExplorerSettings',
        function ($scope, $log, $stateParams, symbolIdCodeService, disableModOneFilter, disableModTwoFilter, limitUseToModFilterFilter, sidExplorerSettings) {
            if ($stateParams.sic) {
                symbolIdCodeService.initializeFromSymbolIdentificationCode($stateParams.sic);

            }
            $scope.settings = sidExplorerSettings.settings;
            $scope.frame = symbolIdCodeService.getFrameFn;
            $scope.main = symbolIdCodeService.getEntityFn;
            $scope.special = symbolIdCodeService.getSpecialEntitySubTypeFn;
            $scope.amplifierFn = symbolIdCodeService.getAmplifierFn;
            $scope.modifierOneFn = symbolIdCodeService.getModifierOneFn;
            $scope.modifierTwoFn = symbolIdCodeService.getModifierTwoFn;
            $scope.statusFn = symbolIdCodeService.getStatusFn;
            $scope.hqtfdFn = symbolIdCodeService.getHqtfdFn;
            $scope.symbolData = symbolData;
            $scope.hqtfDummy = symbolIdCodeService.symbId.hqtfDummy;
            $scope.context = symbolIdCodeService.symbId.context;
            $scope.standardIdentity = symbolIdCodeService.symbId.standardIdentity;
            $scope.currentSymbolSet = symbolIdCodeService.symbId.symbolSet;
            $scope.status = symbolIdCodeService.symbId.status;
            $scope.amplifier = symbolIdCodeService.symbId.amplifier;
            $scope.amplifierDescriptor = symbolIdCodeService.symbId.amplifierDescriptor;
            $scope.symbId = symbolIdCodeService.symbId;
            $scope.ss = symbolIdCodeService;
            $scope.entity = symbolIdCodeService.symbId.entity;
            $scope.entityType = symbolIdCodeService.symbId.entityType;
            $scope.entitySubType = symbolIdCodeService.symbId.entitySubType;
            $scope.sectorOneModifier = symbolIdCodeService.symbId.sectorOneModifier;
            $scope.sectorTwoModifier = symbolIdCodeService.symbId.sectorTwoModifier;
            $scope.currentEntity = $scope.entitySubType || $scope.entityType || $scope.entity;

            $scope.$watch('settings.useCivilianFrame', function (value) {
                symbolIdCodeService.symbId.useCivilianFrame = value;
            });

            $scope.$watch("context", function (newVal, oldVal) {
                if (newVal !== oldVal) changeContext(newVal);
            });
            $scope.$watch("standardIdentity", function (newVal, oldVal) {
                if (newVal !== oldVal) changeStandardIdentity(newVal);
            });
            $scope.$watch("currentSymbolSet", function (newVal, oldVal) {
                if (newVal !== oldVal) changeSymbolSet(newVal);
            });
            $scope.$watch("status", function (newVal, oldVal) {
                if (newVal !== oldVal) changeStatus(newVal);
            });
            $scope.$watch("hqtfDummy", function (newVal, oldVal) {
                if (newVal !== oldVal) changeHQTFDummy(newVal);
            });
            $scope.$watch("amplifier", function (newVal, oldVal) {
                if (newVal !== oldVal) changeAmplifier(newVal);
            });
            $scope.$watch("amplifierDescriptor", function (newVal, oldVal) {
                if (newVal !== oldVal) changeAmplifierDescriptor(newVal);
            });
            $scope.$watch("entity", function (newVal, oldVal) {
                if (newVal !== oldVal) changeEntity(newVal);
            });
            $scope.$watch("entityType", function (newVal, oldVal) {
                if (newVal !== oldVal) changeEntityType(newVal);
            });
            $scope.$watch("entitySubType", function (newVal, oldVal) {
                if (newVal !== oldVal) changeEntitySubType(newVal);
            });
            $scope.$watch("sectorOneModifier", function (newVal, oldVal) {
                if (newVal !== oldVal) symbolIdCodeService.setSectorOneModifier(newVal);
            });

            $scope.$watch("sectorTwoModifier", function (newVal, oldVal) {
                if (newVal !== oldVal) symbolIdCodeService.setSectorTwoModifier(newVal);
            });


            function changeContext(context) {
                symbolIdCodeService.setContext(context);
            };

            function changeStandardIdentity(standardIdentity) {
                symbolIdCodeService.setStandardIdentity(standardIdentity);

            };

            function changeSymbolSet(symbolSet) {
                if (!symbolSet) {
                    return;
                }
                symbolIdCodeService.setSymbolSet(symbolSet);
                $scope.entity = null;

                $scope.entity = symbolSet.entities[0];
                changeEntity(symbolSet.entities[0]);
                $scope.sectorOneModifier = null;
                $scope.sectorTwoModifier = null;
                symbolIdCodeService.setSectorOneModifier(null);
                symbolIdCodeService.setSectorTwoModifier(null);
                $scope.amplifier = symbolData.amplifier[0];
                changeAmplifier(symbolData.amplifier[0]);

            };

            function changeStatus(status) {
                symbolIdCodeService.setStatus(status);
            };

            $scope.$watch("settings.alternateAmplifiers", function (alternateAmplifiers) {
                symbolIdCodeService.setAlternateAmplifiers(alternateAmplifiers);
            });

            function changeHQTFDummy(hqTfDummy) {
                symbolIdCodeService.setHQTFDummy(hqTfDummy);
            };

            function changeAmplifier(amplifier) {
                symbolIdCodeService.setAmplifier(amplifier);
                $scope.amplifierDescriptor = amplifier.descriptors[0];
                changeAmplifierDescriptor(amplifier.descriptors[0]);
            };

            function changeAmplifierDescriptor(amplifierDescriptor) {
                symbolIdCodeService.setAmplifierDescriptor(amplifierDescriptor);
            };

            function changeEntity(entity) {
                symbolIdCodeService.setEntity(entity);
                $scope.entityType = null;
                changeEntityType(null);
            };

            function changeEntityType(entityType) {
                symbolIdCodeService.setEntityType(entityType);
                $scope.entitySubType = null;
                changeEntitySubType(null);
            };

            function checkLimitUseTo(item) {
                if (settings.limitUseTo && item && item.limitUseTo) {
                    if (($scope.entitySubType && item.limitUseTo.indexOf($scope.entitySubType.id) >= 0)
                        || ($scope.entityType && item.limitUseTo.indexOf($scope.entityType.id) >= 0)
                        || ($scope.entity && item.limitUseTo.indexOf($scope.entity.id) >= 0)) {
                        return true;
                    }
                }
                return false
            }

            function resetModifiers(currentEntity) {
                if (disableModOneFilter(currentEntity) || checkLimitUseTo($scope.sectorOneModifier)) {
                    symbolIdCodeService.setSectorOneModifier(null);
                    $scope.sectorOneModifier = symbolIdCodeService.symbId.sectorOneModifier;
                }
                if (disableModTwoFilter(currentEntity) || checkLimitUseTo($scope.sectorOneModifier)) {
                    symbolIdCodeService.setSectorTwoModifier(null);
                    $scope.sectorTwoModifier = symbolIdCodeService.symbId.sectorTwoModifier;
                }

            }

            function changeEntitySubType(entitySubType) {
                symbolIdCodeService.setEntitySubType(entitySubType);
                $scope.currentEntity = $scope.entitySubType || $scope.entityType || $scope.entity;
                resetModifiers($scope.currentEntity);
            };

            $scope.getEntitySubTypes = function () {
                var subtypes = [];
                if ($scope.entityType) {
                    if ($scope.currentSymbolSet.specialEntitySubTypes) {
                        return $scope.entityType.entitySubTypes.concat($scope.currentSymbolSet.specialEntitySubTypes);
                    }
                    return $scope.entityType.entitySubTypes;
                }
                return null;
            };


            $scope.getLabel = function (element) {
                return element.digits + " " + element.label;
            };

            $scope.saveAsPng = function () {
                function loadImages(sources, callback) {
                    var images = {};
                    var loadedImages = 0;
                    var numImages = 0;
                    // get num of sources
                    for (var src in sources) {
                        if (sources[src]) {
                            numImages++;
                        }
                    }
                    for (var src in sources) {
                        if (sources[src]) {
                            images[src] = new Image();
                            images[src].onload = function () {
                                if (++loadedImages >= numImages) {
                                    callback(images);
                                }
                            };
                            images[src].src = sources[src];
                        }
                    }
                }

                function drawImage(source) {
                    if (source) {
                        var myCanvasContext = $scope.myCanvas.getContext('2d');
                        myCanvasContext.drawImage(source, 0, 0, $scope.myCanvas.width, $scope.myCanvas.height);
                    }

                }

                if (!$scope.myCanvas) {
                    var myCanvas = document.createElement('canvas');
                    myCanvas.width = 612;
                    myCanvas.height = 792;
                    $scope.myCanvas = myCanvas;
                } else {
                    var context = $scope.myCanvas.getContext('2d');
                    context.clearRect(0, 0, $scope.myCanvas.width, $scope.myCanvas.height);
                }

                var sources = {
                    frame: $scope.frame(),
                    main: $scope.main(),
                    special: $scope.special(),
                    modifierOneFn: $scope.modifierOneFn(),
                    modifierTwoFn: $scope.modifierTwoFn(),
                    amplifierFn: $scope.amplifierFn(),
                    statusFn: $scope.statusFn(),
                    hqtfdFn: $scope.hqtfdFn()

                };

                loadImages(sources, function (images) {
                    drawImage(images.frame);
                    drawImage(images.main);
                    drawImage(images.special);
                    drawImage(images.modifierOneFn);
                    drawImage(images.modifierTwoFn);
                    drawImage(images.amplifierFn);
                    drawImage(images.statusFn);
                    drawImage(images.hqtfdFn);
                    $scope.myCanvas.toBlob(function (blob) {
                        var fileName = symbolIdCodeService.getSymbolIdentificationCode() + '.png';
                        saveAs(blob, fileName);
                    });

                });
            };

            $scope.copySic = function () {
                return symbolIdCodeService.getSymbolIdentificationCode();
            }

        }])

    .controller('SymbolIdCodeCtrl', ['$scope', 'symbolIdCodeService', function ($scope, symbolCodeIdService) {
        var sid = symbolCodeIdService.symbId;
        $scope.symbId = symbolCodeIdService.symbId;
        $scope.sid = symbolCodeIdService.getSymbolIdentificationCode;
        $scope.gget = function (name) {
            return sid[name] || {"label": "Undefined", "digits": "00"};

        };
    }])

    .filter('limitUseToModFilter', function () {
        return function (input, scope, isEnabled) {
            if (isEnabled) {
                return input.filter(function (item) {
                    if (item.limitUseTo) {
                        if ((scope.entitySubType && item.limitUseTo.indexOf(scope.entitySubType.id) >= 0)
                            || (scope.entityType && item.limitUseTo.indexOf(scope.entityType.id) >= 0)
                            || (scope.entity && item.limitUseTo.indexOf(scope.entity.id) >= 0)) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        return true
                    }
                });
            }
            else {
                return input;
            }
        };
    })

    .filter('disableModOne', function () {
        return function (entity) {
            if (!entity)
                return false;
            switch (entity.icon) {
                case "FULL_OCTAGON":
                case "MAIN_1":
                    return true;
                default:
                    return false;
            }
            return false;
        };
    })

    .filter('disableModTwo', function () {
        return function (entity) {
            if (!entity)
                return false
            switch (entity.icon) {
                case "FULL_OCTAGON":
                case "MAIN_2":
                    return true;
                default:
                    return false;
            }
            return false;
        };
    })
;




