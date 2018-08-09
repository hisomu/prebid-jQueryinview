var adUnits = {
  Dynamic: {
    DefaultSize: [300, 250],
    DivId: 'div-da-lazyload',
    TagId: '/19968336/header-bid-tag-0'
  },
  DynamicAdUnit: [{
    code: 'div-da-dynamicx',
    sizes: [[320, 250], [320, 100], [320, 50], [300, 250]],
    bids: [
      { bidder: 'appnexusAst', params: { placementId: 13144370 } }
    ]
  }]
};

PREBID_TIMEOUT = 700;

function initDynamicAd(divIdArr) {
  googletag.cmd.push(function () {
    var adSlotArr = [];
    var adUnitArr = [];
    for (var i = 0; i < divIdArr.length; i++) {
      var divId = divIdArr[i];

      var adSlot = googletag.defineSlot(adUnits.Dynamic.TagId, adUnits.Dynamic.DefaultSize, divId);
      adUnits.Dynamic.AdSlot = adSlot;
      adSlot.addService(googletag.pubads());

      adSlotArr.push(adSlot);

      var adUnit = adUnits.DynamicAdUnit;

      $.each(adUnit, function (index, value) {
        value.code = divId;
      });
      // created a cloned array using JSON as it appears that code value is the same if not cloned
      adUnitArr = adUnitArr.concat(JSON.parse(JSON.stringify(adUnit)));
    }

    pbjs.que.push(function () {
      pbjs.initAdserverSet = true;
      pbjs.requestBids({
        timeout: PREBID_TIMEOUT, //cut down auction time incase it's not reading from PREBID_TIMEOUT
        adUnits: adUnitArr,
        bidsBackHandler: function bidsBackHandler(bidResponses) {
          pbjs.cmd.push(function () {
            // set KVs for Prebid bid
            pbjs.setTargetingForGPTAsync();

            // trigger DFP call for dynamic ad slot(s)
            googletag.pubads().refresh(adSlotArr);
          });
        }
      });
    });
  });
}

$(document).ready(function ($) {
  try {
    Handlebars.registerPartial('Ad', $('#ad-partial').html());
    var content = {};
    content.ads = [];
    for (var i = 0; i < 6; i++) {
      content.ads.push({ adTitle: 'lazycontent' + (i + 1) });
    }

    var ad_template = $('#ad-template').html();
    // Compile that into an handlebars template
    var template = Handlebars.compile(ad_template);

    // generate the html for each post
    var placeHolder = $('#div-1');
    var html = template(content);
    placeHolder.append(html);

    $(".dad-dynamic").attr('data-offset', 100); // set offset of 100
    $(".dad-dynamic").on('inviewAd', function (event, visible, index, inviewpart, direction) {
      if (visible) {
        $(this).removeClass('inview');
        initDynamicAd([event.target.id]);
      }
    });
    $(window).trigger('checkInView');
  } catch (e) {
    console.error("Error on preparing lazy load ad.", e);
  }
});