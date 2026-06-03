<?php

namespace Database\Seeders;

use App\Models\Fighter;
use Illuminate\Database\Seeder;

class FighterSeeder extends Seeder
{
    public function run(): void
    {
        $fighters = [
            ['name' => 'APRIL',          'img' => '/images/fighters/april.webp'],
            ['name' => 'AZUMA',          'img' => '/images/fighters/azuma.webp'],
            ['name' => 'BUTCHER',        'img' => '/images/fighters/butcher.webp'],
            ['name' => 'COBRA',          'img' => '/images/fighters/cobra.webp'],
            ['name' => 'EMPEROR',        'img' => '/images/fighters/emperor.webp'],
            ['name' => 'FIRE GUARD',     'img' => '/images/fighters/fire_guard.webp'],
            ['name' => 'HELGA',          'img' => '/images/fighters/helga.webp'],
            ['name' => 'HONG JOO',       'img' => '/images/fighters/hong_joo.webp'],
            ['name' => 'IRONCLAD',       'img' => '/images/fighters/ironclad.webp'],
            ['name' => 'ITU',            'img' => '/images/fighters/itu.webp'],
            ['name' => 'JACK BULWARK',   'img' => '/images/fighters/jack_bulwark.webp'],
            ['name' => 'JET',            'img' => '/images/fighters/jet.webp'],
            ['name' => 'JUNE',           'img' => '/images/fighters/june.webp'],
            ['name' => 'KATE',           'img' => '/images/fighters/kate.webp'],
            ['name' => 'KIBO',           'img' => '/images/fighters/kibo.webp'],
            ['name' => 'KING OF LEGION', 'img' => '/images/fighters/king_of_legion.webp'],
            ['name' => 'LING',           'img' => '/images/fighters/ling.webp'],
            ['name' => 'LORD GIDEON',    'img' => '/images/fighters/lord_gideon.webp'],
            ['name' => 'LYNX',           'img' => '/images/fighters/lynx.webp'],
            ['name' => 'MARCUS',         'img' => '/images/fighters/marcus.webp'],
            ['name' => 'MIDNIGHT',       'img' => '/images/fighters/midnight.webp'],
            ['name' => 'MONKEY KING',    'img' => '/images/fighters/monkey_king.webp'],
            ['name' => 'NONNA',          'img' => '/images/fighters/nonna.webp'],
            ['name' => 'RAIKICHI',       'img' => '/images/fighters/raikichi.webp'],
            ['name' => 'SARGE',          'img' => '/images/fighters/sarge.webp'],
            ['name' => 'SHADOW BEAST',   'img' => '/images/fighters/Shadow Beast.webp'],
            ['name' => 'SHADOW MIND',    'img' => '/images/fighters/shadow_mind.webp'],
            ['name' => 'SHANG',          'img' => '/images/fighters/shang.webp'],
            ['name' => 'WIDOW',          'img' => '/images/fighters/widow.webp'],
            ['name' => 'XIANG TZU',      'img' => '/images/fighters/xiang_tzu.webp'],
            ['name' => 'YUKKA',          'img' => '/images/fighters/yukka.webp'],
            ['name' => 'YUNLIN',         'img' => '/images/fighters/yunlin.webp'],
        ];

        foreach ($fighters as $f) {
            Fighter::where('name', $f['name'])->update(['image_path' => $f['img']]);
            Fighter::firstOrCreate(
                ['name' => $f['name']],
                ['game' => 'Shadow Fight 4: Arena', 'is_active' => true, 'image_path' => $f['img']]
            );
        }
    }
}
