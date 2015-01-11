angular.module('symbolApp')
    .factory('SicObject', ['$log', 'config', 'pathService', function ($log, config, pathService) {
        var SicObject = function (sic, alternative) {
            this.sic = sic;
            this.alternative = alternative;
            if (sic.length !== 20) {
                return
            }
            this.context = sic.substr(2, 1);
            this.standardIdentity = sic.substr(3, 1);
            this.symbolSet = sic.substr(4, 2);
            this.status = sic.substr(6, 1);
            this.entity = sic.substr(10, 2);
            this.entityType = sic.substr(12, 2);
            this.entitySubType = sic.substr(14, 2);

            this.contextObj = findSymbolObject(symbolData.contexts, this.context);
            this.standardIdentityObj = findSymbolObject(symbolData.standardIdentities, this.standardIdentity);
            this.symbolSetObj = findSymbolObject(symbolData.symbolSets, this.symbolSet);
            this.entityObj = findSymbolObject(this.symbolSetObj.entities, this.entity);


            if (this.entityType !== '00') {
                this.entityTypeObj = findSymbolObject(this.entityObj.entityTypes, this.entityType);
                if (this.entitySubType !== '00' && this.entityTypeObj.entitySubTypes.length > 0) {
                    this.entitySubTypeObj = findSymbolObject(this.entityTypeObj.entitySubTypes, this.entitySubType);
                } else {
                    this.entitySubTypeObj = null;
                }
            } else {
                this.entityTypeObj = null;
            }

            // Get main icon
            var gg = this.entitySubTypeObj || this.entityTypeObj || this.entityObj;

            this.entityFn = pathService.getEntityFilePath(gg, this.symbolSetObj, this.standardIdentityObj.id, this.alternative) || config.BLANK_PATH;

            // Get frame
            if (!this.contextObj) {
                return;
            }
            var contextId = this.contextObj.id,
                siId = this.standardIdentityObj.id;

            this.frameFn = pathService.getFrameFilePath(contextId, siId, this.symbolSetObj) || config.BLANK_PATH;
        };
        SicObject.prototype.getSic = function () {
            return this.sic;
        };
        return SicObject;
    }])


    .directive('milsymbol', ['$log', 'SicObject', function ($log, SicObject) {
        function processSIC(sic, alternative) {
            var sicObj = new SicObject(sic, alternative);
            return sicObj;
        }

        function link(scope, element, attrs) {
            var sicObj = processSIC(scope.sic, scope.alternative);
            scope.entityFn = sicObj.entityFn;
            scope.frameFn = sicObj.frameFn;
        }

        return {
            restrict: 'E',
            scope: {
                sic: '@sic',
                alternative: '@alternative'
            },
            template: function (element, attrs) {
                if (attrs.noFrame) {
                    return '<div class="milsymbol"><img class="symbol-sm" ng-src="{{entityFn}}"/></div>'
                }
                return '<div class="milsymbol"><img class="symbol-sm" ng-src="{{frameFn}}"/><img class="symbol-sm" ng-src="{{entityFn}}"/></div>';
            },
            link: link

        };
    }]);