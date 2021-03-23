"use strict";
/**
 * elFinder client options and main script for RequireJS
 *
 * Rename "main.default.js" to "main.js" and edit it if you need configure elFInder options or any things. And use that in elfinder.html.
 * e.g. `<script data-main="./main.js" src="./require.js"></script>`
 **/
(function(){
	var // jQuery and jQueryUI version
		jqver = '3.2.1',
		uiver = '1.12.1',
		
		// Detect language (optional)
		lang = (function() {
			var locq = window.location.search,
				fullLang, locm, lang;
			if (locq && (locm = locq.match(/lang=([a-zA-Z_-]+)/))) {
				// detection by url query (?lang=xx)
				fullLang = locm[1];
			} else {
				// detection by browser language
				fullLang = (navigator.browserLanguage || navigator.language || navigator.userLanguage);
			}
			lang = fullLang.substr(0,2);
			if (lang === 'ja') lang = 'jp';
			else if (lang === 'pt') lang = 'pt_BR';
			else if (lang === 'ug') lang = 'ug_CN';
			else if (lang === 'zh') lang = (fullLang.substr(0,5) === 'zh-TW')? 'zh_TW' : 'zh_CN';
			return lang;
		})(),
		
		// Start CKEditor with elFinder
		start = function(CKEDITOR, elFinder) {
			// load jQueryUI CSS
			elFinder.prototype.loadCss('//cdnjs.cloudflare.com/ajax/libs/jqueryui/'+uiver+'/themes/smoothness/jquery-ui.css');
			$(function() {
				var elfNode, elfInsrance, dialogName,
					elfUrl = './php/connector.minimal.php', // Your connector's URL
					elfDirHashMap = { // Dialog name / elFinder holder hash Map
						image : 'l3_Q0tFX0ltZ3M', // for example to demo's 3st LocalFileVolume : `/CKE_Imgs`
						flash : '',
						files : '',
						link  : '',
						fb    : 'l2_Lw' // Fall back target : `/`
					},
					imgShowMaxSize = 400, // Max image size(px) to show
					customData = {},
					// Set image size to show
					setShowImgSize = function(url, callback) {
						$('<img/>').attr('src', url).on('load', function() {
							var w = this.naturalWidth,
								h = this.naturalHeight,
								s = imgShowMaxSize;
							if (w > s || h > s) {
								if (w > h) {
									h = Math.floor(h * (s / w));
									w = s;
								} else {
									w = Math.floor(w * (s / h));
									h = s;
								}
							}
							callback({width: w, height: h});
						});
					},
					// Set values to dialog of CKEditor
					setDialogValue = function(file) {
						var url = file.url,
							dialog = CKEDITOR.dialog.getCurrent(),
							dialogName = dialog._.name,
							tabName = dialog._.currentTabId,
							urlObj;
						if (dialogName == 'image') {
							urlObj = 'txtUrl';
						} else if (dialogName == 'flash') {
							urlObj = 'src';
						} else if (dialogName == 'files' || dialogName == 'link') {
							urlObj = 'url';
						} else if (dialogName == 'image2') {
							urlObj = 'src';
						} else {
							return;
						}
						if (tabName == 'Upload') {
							tabName = 'info';
							dialog.selectPage(tabName);
						}
						dialog.setValueOf(tabName, urlObj, url);
						if (dialogName == 'image' && tabName == 'info') {
							setShowImgSize(url, function(size) {
								dialog.setValueOf('info', 'txtWidth', size.width);
								dialog.setValueOf('info', 'txtHeight', size.height);
								dialog.preview.$.style.width = size.width+'px';
								dialog.preview.$.style.height = size.height+'px';
								dialog.setValueOf('Link', 'txtUrl', url);
								dialog.setValueOf('Link', 'cmbTarget', '_blank');
							});
						} else if (dialogName == 'image2' && tabName == 'info') {
							dialog.setValueOf(tabName, 'alt', file.name + ' (' + elfInsrance.formatSize(file.size) + ')');
							setShowImgSize(url, function(size) {
								setTimeout(function() {
									dialog.setValueOf('info', 'width', size.width);
									dialog.setValueOf('info', 'height', size.height);
								}, 100);
							});
						} else if (dialogName == 'files' || dialogName == 'link') {
							try {
								dialog.setValueOf('info', 'linkDisplayText', file.name);
							} catch(e) {}
						}
					};

				// Setup upload tab in CKEditor dialog
				CKEDITOR.on('dialogDefinition', function (event) {
					var editor = event.editor,
						dialogDefinition = event.data.definition,
						tabCount = dialogDefinition.contents.length,
						browseButton, uploadButton, submitButton, inputId;
					
					for (var i = 0; i < tabCount; i++) {
						try {
							browseButton = dialogDefinition.contents[i].get('browse');
							uploadButton = dialogDefinition.contents[i].get('upload');
							submitButton = dialogDefinition.contents[i].get('uploadButton');
						} catch(e) {
							browseButton = uploadButton = null;
						}

						if (browseButton !== null) {
							browseButton.hidden = false;
							browseButton.onClick = function (dialog, i) {
								dialogName = CKEDITOR.dialog.getCurrent()._.name;
								if (dialogName === 'image2') {
									dialogName = 'image';
								}
								if (elfNode) {
									if (elfDirHashMap[dialogName] && elfDirHashMap[dialogName] != elfInsrance.cwd().hash) {
										elfInsrance.request({
											data	 : {cmd	 : 'open', target : elfDirHashMap[dialogName]},
											notify : {type : 'open', cnt : 1, hideCnt : true},
											syncOnFail : true
										});
									}
									elfNode.dialog('open');
								}
							} 
						} 
						
						if (uploadButton !== null && submitButton !== null) {
							uploadButton.hidden = false;
							submitButton.hidden = false;
							uploadButton.onChange = function() {
								inputId = this.domId;
							}
							// upload a file to elFinder connector
							submitButton.onClick = function(e) {
								dialogName = CKEDITOR.dialog.getCurrent()._.name;
								if (dialogName === 'image2') {
									dialogName = 'image';
								}
								var target = elfDirHashMap[dialogName]? elfDirHashMap[dialogName] : elfDirHashMap['fb'],
									name = $('#'+inputId),
									input = name.find('iframe').contents().find('form').find('input:file'),
									error = function(err) {
										alert(elfInsrance.i18n(err).replace('<br>', '\n'));
									};
								
								if (input.val()) {
									var fd = new FormData();
									fd.append('cmd', 'upload');
									fd.append('target', target);
									fd.append('overwrite', 0); // Instruction to save alias when same name file exists
									$.each(customData, function(key, val) {
										fd.append(key, val);
									});
									fd.append('upload[]', input[0].files[0]);
									$.ajax({
										url: editor.config.filebrowserUploadUrl,
										type: "POST",
										data: fd,
										processData: false,
										contentType: false,
										dataType: 'json'
									})
									.done(function( data ) {
										if (data.added && data.added[0]) {
											elfInsrance.exec('reload');
											setDialogValue(data.added[0]);
										} else {
											error(data.error || data.warning || 'errUploadFile');
										}
									})
									.fail(function() {
										error('errUploadFile');
									})
									.always(function() {
										input.val('');
									});
								}
								return false;
							}
						}
					} 
				});

				// Create elFinder dialog for CKEditor
				CKEDITOR.on('instanceReady', function(e) {
					elfNode = $('<div style="padding:0;">');
					elfNode.dialog({
						autoOpen: false,
						modal: true,
						width: '80%',
						title: 'Server File Manager',
						create: function (event, ui) {
							var startPathHash = (elfDirHashMap[dialogName] && elfDirHashMap[dialogName])? elfDirHashMap[dialogName] : '';
							// elFinder configure
							elfInsrance = $(this).elfinder({
								startPathHash: startPathHash,
								useBrowserHistory: false,
								resizable: false,
								width: '100%',
								url: elfUrl,
								lang: lang,
								dialogContained : true,
								getFileCallback: function(file) {
									setDialogValue(file);
									elfNode.dialog('close');
								}
							}).elfinder('instance');
						},
						open: function() {
							elfNode.find('div.elfinder-toolbar input').blur();
							setTimeout(function(){
								elfInsrance.enable();
							}, 100);
						},
						resizeStop: function() {
							elfNode.trigger('resize');
						}
					}).parent().css({'zIndex':'11000'});

					// CKEditor instance
					var cke = e.editor;
					
					// Setup the procedure when DnD image upload was completed
					cke.widgets.registered.uploadimage.onUploaded = function(upload){
						var self = this;
						setShowImgSize(upload.url, function(size) {
							self.replaceWith('<img src="'+encodeURI(upload.url)+'" width="'+size.width+'" height="'+size.height+'"></img>');
						});
					}
					
					// Setup the procedure when send DnD image upload data to elFinder's connector
					cke.on('fileUploadRequest', function(e){
						var target = elfDirHashMap['image']? elfDirHashMap['image'] : elfDirHashMap['fb'],
							fileLoader = e.data.fileLoader,
							xhr = fileLoader.xhr,
							formData = new FormData();
						e.stop();
						xhr.open('POST', fileLoader.uploadUrl, true);
						formData.append('cmd', 'upload');
						formData.append('target', target);
						formData.append('upload[]', fileLoader.file, fileLoader.fileName);
						xhr.send(formData);
					}, null, null, 4);
					
					// Setup the procedure when got DnD image upload response
					cke.on('fileUploadResponse', function(e){
						var file;
						e.stop();
						var data = e.data,
							res = JSON.parse(data.fileLoader.xhr.responseText);
						if (!res.added || res.added.length < 1) {
							data.message = 'Can not upload.';
							e.cancel();
						} else {
							elfInsrance.exec('reload');
							file = res.added[0];
							if (file.url && file.url != '1') {
								data.url = file.url;
								try {
									data.url = decodeURIComponent(data.url);
								} catch(e) {}
							} else {
								data.url = elfInsrance.options.url + ((elfInsrance.options.url.indexOf('?') === -1)? '?' : '&') + 'cmd=file&target=' + file.hash;
							}
						}
					});
				});
				
				// setup CKEditor
				CKEDITOR.replace('mytextarea', {
					filebrowserBrowseUrl: '#',
					extraPlugins: 'uploadimage,image2',
					filebrowserUploadUrl: './php/connector.minimal.php',
					imageUploadUrl: './php/connector.minimal.php'
				});

				// Remove "Now loading..."
				$('#loading').remove();
				// Show textarea
				$('#mytextarea').show();
			});
		},
		
		// JavaScript loader (REQUIRED)
		load = function() {
			require(
				[
					'ckeditor',
					'elfinder'
					, (lang !== 'en')? 'elfinder.lang' : null    // load detected language
					//, 'extras/quicklook.googledocs'              // optional preview for GoogleApps contents on the GoogleDrive volume
					//, (lang === 'jp')? 'extras/encoding-japanese.min' : null // optional Japanese decoder for archive preview
				],
				start,
				function(error) {
					alert(error.message);
				}
			);
		},
		
		// is IE8? for determine the jQuery version to use (optional)
		ie8 = (typeof window.addEventListener === 'undefined' && typeof document.getElementsByClassName === 'undefined');

	// config of RequireJS (REQUIRED)
	require.config({
		baseUrl : 'js',
		paths : {
			'ckeditor' : '//cdnjs.cloudflare.com/ajax/libs/ckeditor/4.9.2/ckeditor',
			'jquery'   : '//cdnjs.cloudflare.com/ajax/libs/jquery/'+(ie8? '1.12.4' : jqver)+'/jquery.min',
			'jquery-ui': '//cdnjs.cloudflare.com/ajax/libs/jqueryui/'+uiver+'/jquery-ui.min',
			'elfinder' : 'elfinder.full',
			'elfinder.lang': [
				'i18n/elfinder.'+lang,
				'i18n/elfinder.fallback'
			]
		},
		shim : {
			'ckeditor' : { exports : 'CKEDITOR' }
		},
		waitSeconds : 10 // optional
	});

	// load JavaScripts (REQUIRED)
	load();

})();
