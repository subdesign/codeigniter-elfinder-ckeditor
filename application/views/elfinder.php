<!DOCTYPE html>
<html lang="hu">
    <head>
        <meta charset="utf-8">
        <title>elFinder</title>

        <!-- jQuery and jQuery UI (REQUIRED) -->
        <link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/themes/smoothness/jquery-ui.css" />
        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
        <script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js"></script>

        <!-- elFinder CSS (REQUIRED) -->

        <link rel="stylesheet" href="<?php echo base_url('/assets/vendor/elFinder/css/elfinder.full.min.css')?>"/>
        <link rel="stylesheet" href="<?php echo base_url('/assets/vendor/elFinder/css/theme.min.css')?>"/>

        <!-- elFinder JS (REQUIRED) -->
        <script src="<?php echo base_url("assets/vendor/elFinder/js/elfinder.full.js"); ?>"></script>

        <!-- elFinder translation (OPTIONAL) -->
        <script src="<?php echo base_url("assets/vendor/elFinder/js/i18n/elfinder.en"); ?>"></script>

        
        <!-- elFinder initialization (REQUIRED) -->
        <script type="text/javascript" charset="utf-8">
            // Helper function to get parameters from the query string.
            function getUrlParam(paramName) {
                var reParam = new RegExp('(?:[\?&]|&amp;)' + paramName + '=([^&]+)', 'i') ;
                var match = window.location.search.match(reParam) ;

                return (match && match.length > 1) ? match[1] : '' ;
            }

            $().ready(function() {
                var funcNum = getUrlParam('CKEditorFuncNum');
                var $window = $(window);

                var elf = $('#elfinder').elfinder({
                    // set your elFinder options here
                    resizable: true,
                    height:  $window.height()-15,
                    lang: 'en', // locale
                    url: '<?php echo $connector;?>',  // connector URL
                    customData: { 
                        <?php echo $this->security->get_csrf_token_name(); ?>: '<?php echo $this->security->get_csrf_hash(); ?>'
                    },
                    uiOptions: {
                        // toolbar configuration
                        toolbar: [
                            ['home', 'back', 'forward', 'up', 'reload'],
                            ['mkdir', 'mkfile', 'upload'],
                            ['open', 'download', 'getfile'],
                            ['undo', 'redo'],
                            ['copy', 'cut', 'paste'],
                            ['duplicate', 'rename', 'edit', 'resize', 'chmod'],
                            ['selectall', 'selectnone', 'selectinvert'],
                            ['quicklook', 'info'],
                            ['extract', 'archive'],
                            ['search'],
                            ['view', 'sort'],
                            ['fullscreen']
                        ]
                    },
                    soundPath: '',
                    getFileCallback : function(file) {
                        window.opener.CKEDITOR.tools.callFunction(funcNum, file.url);
                        window.close();
                    }
                }).elfinder('instance');

                $window.resize(function(){
                     var win_height = $window.height()-15;
                     if( elf.options.height != win_height ){
                           elf.resize('auto',win_height);
                     }
                 })
            });
        </script>
    </head>
    <body>

            <!-- Element where elFinder will be created (REQUIRED) -->
            <div style="margin:0 ;padding:0">
                <div id="elfinder"></div>
            </div>

    </body>
</html>
