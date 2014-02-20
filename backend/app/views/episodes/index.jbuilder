json.array! @episodes do |episode|
  json.id episode.id
  json.index episode.episode_index
  json.title episode.title
  json.episode_number episode.episode_number
  json.season_number episode.season_number
  json.aired_at episode.aired_at
end