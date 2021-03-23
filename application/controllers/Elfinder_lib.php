<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Elfinder_lib extends CI_Controller {

        public function manager()
        {
            $this->load->helper('url');
            $data['connector'] = site_url() . '/Elfinder_lib/connector';
            $this->load->view('elfinder', $data);
        }
        
        public function connector()
        {
            $this->load->helper('url');
            $opts = array(
                'debug' => true,
                'roots' => array(
                    array( 
                        'driver'        => 'LocalFileSystem',
                        'path'          => FCPATH . '/assets/uploads',
                        'URL'           => base_url('assets/uploads'),
                        'tmbURL'        => base_url('assets/uploads/.tmb'),
                        'tmbPath'       => FCPATH .'/assets/uploads/.tmb',
                        'uploadDeny'    => array('all'),                  // All Mimetypes not allowed to upload
                        'uploadAllow'   => array(
                            'image', 
                            'text/plain', 
                            'application/pdf', 
                            'application/msword', 
                            'application/vnd.openxmlformats-officedocument.wordprocessingm',
                            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                            'application/x-httpd-php',
                            'application/vnd.ms-powerpoint',
                            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                            'application/vnd.rar',
                            'application/vnd.ms-excel',
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                            'application/zip',
                            'application/vnd.oasis.opendocument.text'
                        ),
                        'uploadOrder'   => array('deny', 'allow'),        // allowed Mimetype `image` and `text/plain` only
                        'accessControl' => array($this, 'elfinderAccess'),// disable and hide dot starting files (OPTIONAL)
                        // more elFinder options here
                    ) 
                ),
            );
            $connector = new elFinderConnector(new elFinder($opts));
            $connector->run();
        }
        
        public function elfinderAccess($attr, $path, $data, $volume, $isDir, $relpath)
        {
            $basename = basename($path);

            // if file/folder begins with '.' (dot) but with out volume root set read+write to false, other (locked+hidden) set to true
            return $basename[0] === '.' && strlen($relpath) !== 1           
                ? !($attr == 'read' || $attr == 'write') 
                :  null;  
        }
}