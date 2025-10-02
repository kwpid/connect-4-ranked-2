# Banner Images

This folder contains banner images for the game. Banners are 150x35 PNG images that display behind player usernames.

## Required Banner Images

Replace the placeholder files with actual 150x35 PNG images:

### Shop Banners
- `classic_red.png` - Classic Red banner
- `ocean_blue.png` - Ocean Blue banner  
- `forest_green.png` - Forest Green banner

### Ranked Season 1 Banners
- `bronze_season_1.png` - Bronze Season 1 banner
- `silver_season_1.png` - Silver Season 1 banner
- `gold_season_1.png` - Gold Season 1 banner
- `platinum_season_1.png` - Platinum Season 1 banner
- `diamond_season_1.png` - Diamond Season 1 banner
- `champion_season_1.png` - Champion Season 1 banner
- `grand_champion_season_1.png` - Grand Champion Season 1 banner
- `connect_legend_season_1.png` - Connect Legend Season 1 banner

### Default Banner
- `default.png` - Default banner (already included)

## Adding New Banners

To add new banners, update `client/public/banners.json` following this format:

```json
{
  "bannerId": <unique_id>,
  "bannerName": "<Display Name>",
  "imageName": "<filename>.png",
  "price": <coin_price_or_null>,
  "ranked": <true_or_false>,
  "season": <season_number_or_null>,
  "rank": "<Rank_Name_or_null>"
}
```

- Shop banners: Set `price` to a number > 0, `ranked` to false
- Ranked banners: Set `price` to null, `ranked` to true, and specify `season` and `rank`
