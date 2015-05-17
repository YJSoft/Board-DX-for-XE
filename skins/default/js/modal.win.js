/* NHN (developers@xpressengine.com) Modal Window
 * @Optimizer for BoardDX by phiDel (xe.phidel@gmail.com) */

jQuery.fn.pidModalFlashFix = function(){
	var $ = jQuery;
	$('embed[type*=flash]',this).each(function(){var o=$(this);if(o.attr('wmode')!='transparent');o.attr('wmode', 'opaque');});
	$('iframe[src*=youtube]',this).each(function(){var o=$(this);o.attr('src',(o.attr('src')).setQuery('wmode', 'opaque'));});
};

// Modal Window
jQuery(function($){
	var ESC = 27;
	var pidModalStack = [];
	var pidModalInitailZIndex = 1041;

	// modal backdrop
	var $pidModalBackdrop = $('<div class="pid_modal-backdrop" style="width:100%;height:100%"></div>').appendTo('body').hide();

	$.fn.pidModalWindow = function(){
		this
			.not('.pid_modal-window')
			.addClass('pid_modal-window')
			.each(function() {
				$($(this).attr('href')).hide();
			})
			.click(function()
			{
				var $this = $(this);
				if( $($this.attr('href')).data('state') == 'showing') {
					$this.trigger('close.mw');
				} else {
					$this.trigger('open.mw');
				}
				return false;
			})
			.bind('open.mw', function()
			{
				var $this = $(this), before_event, $modal, $btnClose, duration, target, zidx = 90;

				// get and initialize modal window
				$modal = $( $this.attr('href') );
				// set the related anchor
				$modal.data('anchor', $this);

				target = $this.attr('data-target') || '';

				if(!target && !$modal.parent('body').length) {

					$modal.find('[data-modal-hide]').click(function(){ $modal.data('anchor').trigger('close.mw'); });
					$btnClose = $('<button type="button" class="pid_modal-close">&times;</button>');
					$btnClose.click(function(){ $modal.data('anchor').trigger('close.mw'); });
					$modal.prepend($btnClose); // prepend close button
					$('body').append($modal);

				} else if(target && !$modal.parent(target).length) {

					$(target).before($modal);
					$modal.data('target', target);
				}

				// before event trigger
				before_event = $.Event('before-open.mw');
				$this.trigger(before_event);
				// is event canceled?
				if(before_event.isDefaultPrevented()) return false;
				// get duration
				duration = $this.data('duration') || 'fast';
				// set state : showing
				$modal.data('state', 'showing');
				// after event trigger
				function after(){$this.trigger('after-open.mw');}

				if(target) {

					zidx = 0;
					$(target).hide(duration);
				} else {

					$('body > *').filter(function(){ return $(this).css('z-index') !== 'auto'; })
					.each(function(event){
	    				var thzidx = parseInt($(this).css('z-index'));
						if(zidx < thzidx) zidx = thzidx;
					});

					$(document).bind('keydown.mw', function(event){
						if(event.which == ESC) {
							$this.trigger('close.mw');
							return false;
						}
					});

					$('body').css('overflow','hidden');
					$pidModalBackdrop.css('z-index', ++zidx).show();
				}

				$modal.css('z-index', ++zidx)
					.fadeIn(duration, after)
					.find('button.pid_modal-close:first').focus();
			})
			.bind('close.mw', function(){
				var $this = $(this), before_event, $modal, duration, target;

				// before event trigger
				before_event = $.Event('before-close.mw');
				$this.trigger(before_event);
				// is event canceled?
				if(before_event.isDefaultPrevented()) return false;

				// get modal window
				$modal = $($this.attr('href'));
				// get duration
				duration = $this.data('duration') || 'fast';
				// set state : hiding
				$modal.data('state', 'hiding');
				// after event trigger
				function after(){$this.trigger('after-close.mw');}

				target = $this.attr('data-target') || '';

				$modal.fadeOut(duration, function(){$(this).css('z-index', '92');after();});

				if(target) {

					$(target).show(duration);

				} else {

					$pidModalBackdrop.hide().css('z-index', '91');
					$('body').css('overflow','auto');
				}

				$this.focus();
			});
	};

	/** phiDel (xe.phidel@gmail.com) **/
	// $('a.pidModalAnchor').pidModalWindow();

    $.fn.pidModalResize = function(resize)
    {
        var $this = $(this), $body, $form, $mbd, $mbg, pw, ph, t, h, chkh, bdoh, target, timer;

        $body = $this[0].contentDocument || $this[0].contentWindow.document;
        if($body === undefined) return;

        $mbd = $this.parent();
        $body = $('body', $body);
        if($body.is(':empty')) return;

        // DX가 아니면 링크 제어
        if(!$body.find('#siBody').length){
        	$body.find('a').click(function(e){
        		e.stopPropagation(); e.preventDefault();
        		parent.location.replace($(this).attr('href'));
        	});
        }

        $form = $('form:first', $body);

        var isIframe = (parent.location != parent.parent.location);
        if(isIframe) {
        	$mbg = $('.pid_modal-backdrop', $mbd.closest('body'));
        } else $mbg = $(parent);

        resize = resize || 'auto';
        target = $mbd.parent().data('target');

        $body.css({padding: '0', margin: '0', overflow: 'hidden'});
        $form.css({ padding: '0', margin: '0', overflow: 'hidden'});

        //모달이 아니고 타겟이면
        if(target) {
        	$mbd.show();

			$('[data-modal-child=message]', $mbd.closest('body'))
	        .fadeOut(2500, function() {
	            $(this).remove();
	        });

        	timer = setInterval(function()
        	{
		        bdoh = $body.outerHeight(true);
		        if(bdoh) $this.height(bdoh);
        		if ($mbd.is(':hidden')) clearInterval(timer);
        	}, 500);
        } else {
        	$mbd.css({top:0,left:'-150%',height:0}).show();

        	pw = $mbg.outerWidth(true);
        	ph = $mbg.outerHeight(true);

	        if (resize == 'hfix') $body.height(ph - 100);
	        $this.height($body.outerHeight(true));

	        if ($mbd.position().left < 1) {
	            $mbd.animate({
	                top: 10,
	                left: ((pw - $mbd.outerWidth(true)) / 2)
	            },{
	                complete: function() {
				        $('[data-modal-child=message]', $mbd.closest('body'))
				        .fadeOut(2500, function() {
				            $(this).remove();
				        });
	                }
	            });
	        }

        	timer = setInterval(function()
        	{
        		pw = $mbg.outerWidth(true);
        		ph = $mbg.outerHeight(true);

		        bdoh = $body.outerHeight(true);
		        chkh = ph - 100;

		        if(bdoh) {
			        $body.css('overflow-y', chkh > bdoh ? 'hidden' : 'auto');
			        $this.css({
			            'height': (chkh > bdoh ? bdoh : chkh),
			            'width': (pw - 80)
			        });

				    h = $this.outerHeight(true);
				    if(h){
				        $mbd.height(h);
				        h = $mbd.outerHeight(true);
				        t = ((ph - h) / 2) - 10;
				        $mbd.css({
				            top: (t > 10 ? t : 10),
				            left: ((pw - $mbd.outerWidth(true)) / 2)
				        });
				    }
	        	}

	        	if ($mbd.is(':hidden')) clearInterval(timer);
        	}, 500);
	    }
    };

	$.fn.pidModalGoUrl = function(url){
		var $modal = $(this), frId = 'pidOframe', $pidOframe, is_iframe,
			target = $modal.data('target'), waitmsg, sctop = (target || '') ? $(window).scrollTop() : 0;

	    if(!$('.wait[data-modal-child=message]').length) {
	        waitmsg = $('<div class="message update wait">').html(
	            '<p>' + waiting_message + '<br />If time delays continue, <a href="' + url.setQuery('is_modal','') + '"><span>click here</span></a>.</p>'
	        ).attr('data-modal-child','message').css({'position':'absolute','left':'10px','z-index':'9'}).css('top', (sctop+10)+'px');
	     	$modal.append(waitmsg);
	    }


		url = url.setQuery('is_modal','1');
		if(typeof scroll != 'string') scroll = '';
		//is_iframe = (/msie|chromium|chrome/.test(navigator.userAgent.toLowerCase()) === true);

		target = target ? ' data-target="'+target+'"' : '';
		$pidOframe = $('#'+frId, $modal);

		if($pidOframe.length) {
			//(is_iframe) ? $pidOframe.get(0).src = url : $pidOframe.attr('data', url);

			$pidOframe.get(0).src = url;
			$pidOframe.pidModalResize();
		} else {

			// object는 아직 문제가 많아, 그냥 iframe 사용하기로...
			$pidOframe = $('<iframe id="'+frId+'"'+target+' allowTransparency="true" frameborder="0" scrolling="'+(scroll ? scroll : 'auto')+'" />')
				.bind('load', function(){$(this).pidModalResize();})
				.attr('src', url).appendTo($('.pid_modal-body:eq(0)', $modal));

			// if(is_iframe) {
			// 	$('<iframe id="'+frId+'" allowTransparency="true" frameborder="0" scrolling="'+(scroll ? scroll : 'auto')+'" />')
			// 		.load(function(){$(this).pidModalResize();}).attr('src', url).appendTo($('.pid_modal-body:eq(0)', $modal));
			// } else {
			// 	if(scroll == 'no') scroll = 'hidden';
			// 	$('<object id="'+frId+'" style="overflow-x:hidden;overflow-y:'+(scroll ? scroll : 'auto')+'" />')
			// 		.load(function(){$(this).pidModalResize();}).attr('data', url).appendTo($('.pid_modal-body:eq(0)', $modal));
			// }
		}
	};

	$('.pidModalAnchor')
	.bind('before-open.mw', function(e) {

		var $modal = $($(this).attr('href'));
		if(!$(this).attr('data-target')) $modal.find('.pid_modal-body').hide();
	})
	.bind('after-open.mw', function(e) {

		var  $this = $(this), act, param, url, a, i, c, t;

		act = $this.attr('data-modal-act')||'';
		param = $this.attr('data-modal-param')||'';

		if(act||param) {
			a = param.split(',');
			c = a.length - 1;

			//첫 문자가 true면 주소 초기화
			t = (a.length > 0 && a[0]=='true') ? 1 : 0;
			url = t ? default_url : current_url;
			url = url.setQuery('act', act);

			if(t) url = url.setQuery('mid', current_mid);
			for (i = t; i < c; i=i+2) url = url.setQuery(a[i], a[i+1] || '');

			$($(this).attr('href')).pidModalGoUrl(url);
		}
	})
	.bind('before-close.mw', function(e) {

		var $modal = $($(this).attr('href'));
		$modal.find('.pid_modal-body').hide();
		// 자원 제거
		$modal.find('[data-modal-child]').remove();
        $modal.find('.pid_modal-body').children().remove();
	})
	.pidModalWindow();

	try
	{
		// 프레임중 해당 모달창이면...
		if(!self.frames.length && self.location.host == parent.location.host)
		{
			$(self).bind("unload",  function(){
				$('#pidOframe:not([data-target])', parent.document).parent().hide();
			});

			// 닫기 버튼 상단에도 추가
			$('[data-modal-hide]').click(function(){
				$($(this).attr('href'), parent.document).find('button.pid_modal-close:first').click();
		    	return false;
			}).closest('form').each(function(){
				$(this).prepend(
					$('<button type="button" class="scModalClose"">&times;</button>')
						.click(function(){$('[data-modal-hide]:eq(0)').click(); return false;})
				);
			});
		}
	}
	catch(e) {}
});
