json.array! @shows do |show|
  json.id show.id
  json.title show.title
  json.image_url show.image_url
  json.in_production show.in_production
  json.show_started show.show_started
  json.show_ended show.show_ended
  json.subscription_id current_user && current_user.subscription_id(show)
end