(function() {
  'use-strict';

  angular.module('actualWebApp').filter('smartMenuKidsFilter', function() {
    return function smartMenuKidsFilter(items, activeStoreCode) {
      if (!items) return false;

      return items.filter(function(item) {
        return (
          item &&
          item[activeStoreCode] &&
          item.onKidsMenu &&
          !item.complement &&
          item.Childs &&
          item.Childs.length > 0
        );
      });
    };
  });
})();
