<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('feeds:fetch-all')->everyThirtyMinutes();
Schedule::command('articles:purge')->daily();
