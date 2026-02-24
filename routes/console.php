<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('feeds:fetch-all')
    ->everyThirtyMinutes()
    ->withoutOverlapping();
// Schedule::command('articles:purge')->daily();
