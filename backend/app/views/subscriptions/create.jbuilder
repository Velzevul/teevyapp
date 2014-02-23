json.id @subscription.id

json.show do
  json.id @subscription.show.id
  json.title @subscription.show.title
  json.image_url @subscription.show.image_url
  json.in_production @subscription.show.in_production
  json.show_started @subscription.show.show_started
  json.show_ended @subscription.show.show_ended
end

if (@subscription.episode)
  json.next_unseen do
    json.index @subscription.episode.episode_index
    json.title @subscription.episode.title
    json.season_number @subscription.episode.season_number
    json.episode_number @subscription.episode.episode_number
    json.aired_at @subscription.episode.aired_at
  end
else
  json.next_unseen nil
end

json.last_aired do
  json.season_number @subscription.show.episodes.aired[-1].season_number
  json.episode_number @subscription.show.episodes.aired[-1].episode_number
end