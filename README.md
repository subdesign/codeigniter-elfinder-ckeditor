# CodeIgniter 3 + elFinder 2 + CKEditor 4 
## WORKING EXAMPLE

### Story

I have some old website with Codeigniter made back in 2010, and updated the core code from CI 2 to CI 3 for client request. Previous file manager was KCFinder, but now I wanted something fresh and modern. Truth to be told, I was struggling setting up this combo in Codeigniter, even there are some tutorials and blog posts for that. And separately there are CKEditor integrations, but not under Codeigniter 3.

So after I successfully made these three working together, I created this tutorial repo maybe someone need the same to solve.

<img width="1152" alt="Screenshot 2021-03-23 at 14 38 05" src="https://user-images.githubusercontent.com/691695/112165547-23437480-8bef-11eb-9f34-ec40b5806005.png">

### How-to

1. clone the repo
2. install composer dependencies
```bash
cd yourprojectname
composer install

```
3. set your project url in `config.php`, I'm using [Laravel Valet](https://github.com/laravel/valet), so mine was:
```php
$config['base_url'] = 'http://codeigniter-elfinder-ckeditor.test';

```
and composer's autoload.php path
```php
$config['composer_autoload'] = APPPATH.'/../vendor/autoload.php';
```
4. enter the url in your browser

### Customizations

`application\controller\Elfinder_lib.php`

- create your upload folder, and a `.tmb` folder in it
- set this path in the options array like
```php
$opts = array(
                'debug' => true,
                'roots' => array(
                    array( 
                        'driver'        => 'LocalFileSystem',
                        'path'          => FCPATH . '/assets/uploads',
                        'URL'           => base_url('assets/uploads'),
                        'tmbURL'        => base_url('assets/uploads/.tmb'),
                        'tmbPath'       => FCPATH .'/assets/uploads/.tmb',
                        ...

```
- use your own auth check in the `elfinderAccess` method (pseudo example)
```php
if ( ! $this->auth->is_logged_in()) {
    return false;
}

```

`application\views\elfinder.php`

- update you css and js paths
- set you language

`application\views\welcome_message.php` or your view where CKEditor instance is

- set CKEditor path and settings

### Versions

Codeigniter 3.1.11  
elFinder 2.1.57   
CKEditor 4.16

### Thanks

Thanks for the tutorials in the elFinder github repo, for the basics, and for [barryvdh/laravel-elfinder](https://github.com/barryvdh/laravel-elfinder) for the idea of creating my own `elfinder.php` for Codeigniter.

### Extra

If you interested in using Laravel Valet with Codeigniter, use this driver and enjoy the benefit of Valet.
[https://github.com/veekthoven/codeigniter-valet-driver](https://github.com/veekthoven/codeigniter-valet-driver)

### Contact

Follow me on twitter: [@devartpro](https://twitter.com/devartpro)
